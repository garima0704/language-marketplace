export const guestMenu = [
  {
    title: "Discover",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "Home",
      },
      {
        label: "Browse Videos",
        href: "/videos",
        icon: "Search",
      },
      {
        label: "Sellers",
        href: "/sellers",
        icon: "Users",
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