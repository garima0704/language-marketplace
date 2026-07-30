export const learnerMenu = [
  {
    title: "",
    items: [
      {
        href: "/",
        label: "Home",
        icon: "Home",
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
  {
    title: "For Sellers",
    items: [
      {
        href: "/become-a-seller",
        label: "Become a Seller",
        icon: "PlusCircle",
      },
    ],
  },
] as const;