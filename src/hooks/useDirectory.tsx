import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { CommunityState } from "../atoms/CommunitiesAtom";
import {
  DirectoryMenuItem,
  defaultMenuItem,
  directoryMenuState,
} from "../atoms/directoryMenuAtom";
import { FaReddit } from "react-icons/fa";

const useDirectory = () => {
  const [directoryState, setDirectoryState] =
    useRecoilState(directoryMenuState);
  const router = useRouter();
  const communityStateValue = useRecoilValue(CommunityState);
  const setCommunityStateValue = useSetRecoilState(CommunityState);

  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }));

    // If navigating to Home, clear currentCommunity
    if (menuItem.link === "/" || menuItem === defaultMenuItem) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: undefined,
      }));
    }

    router.push(menuItem.link);
    if (directoryState.isOpen) {
      toggleMenuOpen();
    }
  };

  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: !directoryState.isOpen,
    }));
  };

  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    const isCommentsPage = router.asPath.includes("/comments/");
    const isCommunityPage = router.asPath.startsWith("/r/") && !isCommentsPage && router.asPath !== "/r/[communityId]";
    const isHomePage = router.asPath === "/";

    if (isHomePage) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: defaultMenuItem,
      }));
    } else if (currentCommunity && (isCommunityPage || isCommentsPage)) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: `r/${currentCommunity.name || currentCommunity.id}`,
          link: `/r/${currentCommunity.id}`,
          imageURL: currentCommunity.imageURL,
          icon: FaReddit,
          iconColor: "blue.500",
        },
      }));
    } else if (!currentCommunity) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: defaultMenuItem,
      }));
    }
  }, [communityStateValue, router.asPath, setDirectoryState]);

  return { directoryState, toggleMenuOpen, onSelectMenuItem };
};
export default useDirectory;
