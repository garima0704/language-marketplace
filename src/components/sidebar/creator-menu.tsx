export const creatorMenu = [
  {
    title: "Seller",
    items: [
      {
        href: "/seller/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      {
        href: "/seller/channels",
        label: "My Channels",
        icon: "Tv",
      },
      {
        href: "/seller/videos",
        label: "My Videos",
        icon: "Video",
      },
      {
        href: "/seller/subscribers",
        label: "Subscribers",
        icon: "Users",
      },

      // --------------------------------------------
      // Earnings
      // --------------------------------------------

      {
        href: "/seller/earnings",
        label: "Earnings",
        icon: "DollarSign",
        children: [
          {
            href: "/seller/earnings",
            label: "Overview",
          },
          {
            href: "/seller/earnings/transactions",
            label: "Transactions",
          },
          {
            href: "/seller/earnings/payouts",
            label: "Payouts",
          },
        ],
      },

      {
        href: "/seller/analytics",
        label: "Analytics",
        icon: "BarChart3",
      },
    ],
  },

  {
    title: "Library",
    items: [
      {
        href: "/subscriptions",
        label: "My Subscriptions",
        icon: "CreditCard",
      },
      {
        href: "/saved",
        label: "Saved Videos",
        icon: "Bookmark",
      },
      {
        href: "/history",
        label: "Watch History",
        icon: "History",
      },
    ],
  },
] as const;