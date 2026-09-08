import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const showSidebar = width >= 900;
  const columns = width >= 1280 ? 3 : width >= 720 ? 2 : 1;
  const folderCardWidth = width >= 1024 ? 200 : width >= 640 ? 180 : 168;
  const contentPad = width >= 1024 ? 40 : width >= 640 ? 28 : 20;
  const noteGap = width >= 720 ? 20 : 16;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    showSidebar,
    columns,
    folderCardWidth,
    contentPad,
    noteGap,
  };
}
