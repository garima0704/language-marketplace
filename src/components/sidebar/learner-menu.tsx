export const learnerMenu = [
  {
    title: "",
    items: [
      {
        href: "/",
        label: "sidebar.home",
        icon: "Home",
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

  {
    title: "sidebar.for_sellers",
    items: [
      {
        href: "/become-a-seller",
        label: "sidebar.become_a_seller",
        icon: "PlusCircle",
      },
    ],
  },
] as const;