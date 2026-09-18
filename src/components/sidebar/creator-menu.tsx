export const creatorMenu = [
  {
    title: "sidebar.seller",
    items: [
      {
        href: "/seller/dashboard",
        label: "sidebar.dashboard",
        icon: "LayoutDashboard",
      },
      {
        href: "/seller/channels",
        label: "sidebar.my_channels",
        icon: "Tv",
      },
      {
        href: "/seller/videos",
        label: "sidebar.my_videos",
        icon: "Video",
      },
      {
        href: "/seller/subscribers",
        label: "sidebar.subscribers",
        icon: "Users",
      },
      {
        href: "/seller/earnings",
        label: "sidebar.earnings",
        icon: "DollarSign",
        children: [
          {
            href: "/seller/earnings",
            label: "sidebar.overview",
          },
          {
            href: "/seller/earnings/transactions",
            label: "sidebar.transactions",
          },
          {
            href: "/seller/earnings/payouts",
            label: "sidebar.payouts",
          },
        ],
      },
      {
        href: "/seller/analytics",
        label: "sidebar.analytics",
        icon: "BarChart3",
      },
    ],
  },

  {
    title: "sidebar.library",
    items: [
      {
        href: "/subscriptions",
        label: "sidebar.my_subscriptions",
        icon: "CreditCard",
      },
      {
        href: "/saved",
        label: "sidebar.saved_videos",
        icon: "Bookmark",
      },
      {
        href: "/history",
        label: "sidebar.watch_history",
        icon: "History",
      },
    ],
  },
] as const;