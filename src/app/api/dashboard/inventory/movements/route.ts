import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type InventoryMovementTypeValue =
  | "MANUAL_ADJUSTMENT"
  | "ORDER_CREATED"
  | "ORDER_CANCELLED"
  | "ORDER_RESTORED"
  | "RETURN"
  | "RESTOCK"
  | "DAMAGE"
  | "CORRECTION";

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function getMovementType(value: unknown): InventoryMovementTypeValue | null {
  const movementType = normalizeText(value);

  const allowedTypes: InventoryMovementTypeValue[] = [
    "MANUAL_ADJUSTMENT",
    "ORDER_CREATED",
    "ORDER_CANCELLED",
    "ORDER_RESTORED",
    "RETURN",
    "RESTOCK",
    "DAMAGE",
    "CORRECTION",
  ];

  if (allowedTypes.includes(movementType as InventoryMovementTypeValue)) {
    return movementType as InventoryMovementTypeValue;
  }

  return null;
}

async function getCurrentMerchantStore(
  request: NextRequest,
  storeIdFromQuery?: string | null
) {
  const session = await getSessionFromRequest(request);

  if (!session?.userId) {
    return {
      ok: false,
      status: 401,
      message: "يجب تسجيل الدخول أولًا",
      session: null,
      store: null,
    };
  }

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
    return {
      ok: false,
      status: 403,
      message: "هذه الصفحة مخصصة للتجار فقط",
      session,
      store: null,
    };
  }

  const where =
    session.role === UserRole.SUPER_ADMIN && storeIdFromQuery
      ? { id: storeIdFromQuery }
      : { ownerId: session.userId };

  const store = await prisma.store.findFirst({
    where,
    select: {
      id: true,
      name: true,
      displayName: true,
      slug: true,
      ownerId: true,
      category: true,
    },
  });

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "لا يوجد متجر مرتبط بحسابك",
      session,
      store: null,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    session,
    store,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const storeId = searchParams.get("storeId");
    const q = normalizeText(searchParams.get("q"));
    const itemType = normalizeText(searchParams.get("itemType"));
    const typeValue = normalizeText(searchParams.get("type"));
    const takeValue = Number(searchParams.get("take") || 200);

    const take = Number.isFinite(takeValue)
      ? Math.min(Math.max(Math.floor(takeValue), 20), 500)
      : 200;

    const ownership = await getCurrentMerchantStore(request, storeId);

    if (!ownership.ok || !ownership.store) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
          redirectTo:
            ownership.status === 401
              ? "/merchant/login?next=/dashboard/inventory/movements"
              : "/merchant/welcome",
        },
        { status: ownership.status }
      );
    }

    const where: any = {
      storeId: ownership.store.id,
    };

    const movementType = getMovementType(typeValue);

    if (movementType) {
      where.type = movementType;
    }

    if (itemType === "VARIANT") {
      where.variantId = {
        not: null,
      };
    }

    if (itemType === "PRODUCT") {
      where.variantId = null;
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            category: true,
          },
        },
        variant: {
          select: {
            id: true,
            title: true,
            sku: true,
            barcode: true,
            options: true,
            imageUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    });

    const normalizedMovements = movements.map((movement) => ({
      id: movement.id,
      storeId: movement.storeId,
      productId: movement.productId,
      variantId: movement.variantId,

      itemType: movement.variantId ? "VARIANT" : "PRODUCT",

      productName: movement.product?.name || "منتج غير معروف",
      productCategory: movement.product?.category || null,

      variantTitle: movement.variant?.title || null,
      variantSku: movement.variant?.sku || null,
      variantBarcode: movement.variant?.barcode || null,
      variantOptions: movement.variant?.options || null,

      type: movement.type,

      quantityBefore: movement.quantityBefore,
      quantityChange: movement.quantityChange,
      quantityAfter: movement.quantityAfter,

      reason: movement.reason,
      note: movement.note,

      referenceType: movement.referenceType,
      referenceId: movement.referenceId,

      createdBy: movement.createdBy,
      createdAt: movement.createdAt,
    }));

    const filteredMovements = q
      ? normalizedMovements.filter((movement) => {
          const searchText = [
            movement.productName,
            movement.variantTitle,
            movement.variantSku,
            movement.variantBarcode,
            movement.type,
            movement.reason,
            movement.note,
            movement.referenceType,
            movement.referenceId,
            movement.variantOptions ? JSON.stringify(movement.variantOptions) : "",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchText.includes(q.toLowerCase());
        })
      : normalizedMovements;

    const stats = {
      totalMovements: filteredMovements.length,
      totalIncrease: filteredMovements
        .filter((movement) => movement.quantityChange > 0)
        .reduce((sum, movement) => sum + movement.quantityChange, 0),
      totalDecrease: Math.abs(
        filteredMovements
          .filter((movement) => movement.quantityChange < 0)
          .reduce((sum, movement) => sum + movement.quantityChange, 0)
      ),
      netChange: filteredMovements.reduce(
        (sum, movement) => sum + movement.quantityChange,
        0
      ),
      manualAdjustments: filteredMovements.filter(
        (movement) => movement.type === "MANUAL_ADJUSTMENT"
      ).length,
      orderCreated: filteredMovements.filter(
        (movement) => movement.type === "ORDER_CREATED"
      ).length,
      orderCancelled: filteredMovements.filter(
        (movement) => movement.type === "ORDER_CANCELLED"
      ).length,
    };

    return NextResponse.json({
      success: true,
      store: ownership.store,
      stats,
      movements: filteredMovements,
    });
  } catch (error) {
    console.error("Inventory movements GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل سجل حركة المخزون",
      },
      { status: 500 }
    );
  }
}