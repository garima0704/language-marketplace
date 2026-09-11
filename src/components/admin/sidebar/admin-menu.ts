export const adminMenu = [
  {
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },

  {
    title: "Users",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        icon: "Users",
      },
      {
        href: "/admin/sellers",
        label: "Sellers",
        icon: "UserCheck",
      },
    ],
  },

  {
    title: "Content",
    items: [
      {
        href: "/admin/channels",
        label: "Channels",
        icon: "Tv",
      },
      {
        href: "/admin/videos",
        label: "Videos",
        icon: "Video",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: "FolderTree",
      },
      {
        href: "/admin/languages",
        label: "Languages & Regions",
        icon: "Languages",
      },
      {
        href: "/admin/translations",
        label: "Translations",
        icon: "LanguagesIcon",
      },
    ],
  },

  {
    title: "Marketplace",
    items: [
      {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: "CreditCard",
      },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        href: "/admin/earnings",
        label: "Earnings",
        icon: "DollarSign",
      },
      {
        href: "/admin/payments",
        label: "Payments",
        icon: "CreditCard",
      },
      {
        href: "/admin/payouts",
        label: "Payouts",
        icon: "Wallet",
      },
    ],
  },

  {
    title: "Analytics",
    items: [
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: "BarChart3",
      },
    ],
  },

  {
    title: "Moderation",
    items: [
      {
        href: "/admin/reports",
        label: "Reports",
        icon: "Flag",
      },
    ],
  },

  {
    title: "Website",
    items: [
      {
        href: "/admin/website",
        label: "Website Settings",
        icon: "Globe",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: "Settings",
      },
    ],
  },
] as const;