export const guestMenu = [
  {
    title: "sidebar.discover",
    items: [
      {
        label: "sidebar.home",
        href: "/",
        icon: "Home",
      },
      {
        label: "sidebar.browse_videos",
        href: "/videos",
        icon: "Search",
      },
      {
        label: "sidebar.sellers",
        href: "/sellers",
        icon: "Users",
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