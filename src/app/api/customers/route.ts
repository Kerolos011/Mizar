import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

async function getMerchantStoreIds(userId: string) {
  const stores = await prisma.store.findMany({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
    },
  });

  return stores.map((store) => store.id);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session ||
      (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
          customers: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedStoreId = cleanText(searchParams.get("storeId"));
    const search = cleanText(searchParams.get("search")).toLowerCase();

    let allowedStoreIds: string[] = [];

    if (session.role === "SUPER_ADMIN") {
      if (requestedStoreId) {
        allowedStoreIds = [requestedStoreId];
      }
    }

    if (session.role === "MERCHANT") {
      const merchantStoreIds = await getMerchantStoreIds(session.userId);

      if (requestedStoreId) {
        if (!merchantStoreIds.includes(requestedStoreId)) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not allowed to view customers for this store",
              customers: [],
            },
            { status: 403 }
          );
        }

        allowedStoreIds = [requestedStoreId];
      } else {
        allowedStoreIds = merchantStoreIds;
      }
    }

    if (session.role !== "SUPER_ADMIN" && allowedStoreIds.length === 0) {
      return NextResponse.json({
        success: true,
        customers: [],
      });
    }

    const storeFilter =
      session.role === "SUPER_ADMIN" && !requestedStoreId
        ? {}
        : {
            storeId: {
              in: allowedStoreIds,
            },
          };

    const userStoreFilter =
      session.role === "SUPER_ADMIN" && !requestedStoreId
        ? {}
        : {
            customerStoreId: {
              in: allowedStoreIds,
            },
          };

    const [registeredUsers, orders] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: UserRole.CUSTOMER,
          ...userStoreFilter,
        },
        include: {
          customerStore: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.order.findMany({
        where: storeFilter,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const customersMap = new Map<
      string,
      {
        id: string;
        name: string;
        phone: string;
        city: string;
        address: string;
        notes?: string | null;
        createdAt: Date;
        store: {
          id: string;
          name: string;
          slug: string;
        };
        user?: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role: string;
        } | null;
        orders: {
          id: string;
          total: number;
          status: string;
          createdAt: Date;
        }[];
      }
    >();

    for (const user of registeredUsers) {
      if (!user.customerStore) continue;

      const key = `user:${user.id}`;

      customersMap.set(key, {
        id: user.id,
        name: user.name,
        phone: user.phone || "",
        city: "",
        address: "",
        notes: null,
        createdAt: user.createdAt,
        store: user.customerStore,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        orders: [],
      });
    }

    for (const order of orders) {
      const customer = order.customer;

      if (!customer) continue;

      const key = customer.userId
        ? `user:${customer.userId}`
        : `phone:${order.storeId}:${customer.phone}`;

      const existingCustomer = customersMap.get(key);

      if (existingCustomer) {
        existingCustomer.name = customer.name || existingCustomer.name;
        existingCustomer.phone = customer.phone || existingCustomer.phone;
        existingCustomer.city = customer.city || existingCustomer.city;
        existingCustomer.address = customer.address || existingCustomer.address;
        existingCustomer.notes = customer.notes || existingCustomer.notes;
        existingCustomer.store = order.store;
        existingCustomer.user = customer.user || existingCustomer.user || null;

        existingCustomer.orders.push({
          id: order.id,
          total: Number(order.total || 0),
          status: order.status,
          createdAt: order.createdAt,
        });

        customersMap.set(key, existingCustomer);
      } else {
        customersMap.set(key, {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          city: customer.city,
          address: customer.address,
          notes: customer.notes,
          createdAt: customer.createdAt,
          store: order.store,
          user: customer.user || null,
          orders: [
            {
              id: order.id,
              total: Number(order.total || 0),
              status: order.status,
              createdAt: order.createdAt,
            },
          ],
        });
      }
    }

    let customers = Array.from(customersMap.values()).map((customer) => ({
      ...customer,
      orders: customer.orders.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    }));

    if (search) {
      customers = customers.filter((customer) => {
        const name = String(customer.name || "").toLowerCase();
        const phone = String(customer.phone || "").toLowerCase();
        const city = String(customer.city || "").toLowerCase();
        const address = String(customer.address || "").toLowerCase();
        const email = String(customer.user?.email || "").toLowerCase();

        return (
          name.includes(search) ||
          phone.includes(search) ||
          city.includes(search) ||
          address.includes(search) ||
          email.includes(search)
        );
      });
    }

    customers.sort((a, b) => {
      const aLatestOrder = a.orders[0]?.createdAt || a.createdAt;
      const bLatestOrder = b.orders[0]?.createdAt || b.createdAt;

      return (
        new Date(bLatestOrder).getTime() - new Date(aLatestOrder).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load customers",
        customers: [],
      },
      { status: 500 }
    );
  }
}