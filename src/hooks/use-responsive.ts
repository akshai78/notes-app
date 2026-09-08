import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const showSidebar = width >= 900;
  const columns = width >= 1280 ? 3 : width >= 720 ? 2 : 1;
  const folderCardWidth = width >= 1024 ? 176 : width >= 640 ? 164 : 152;
  const contentPad = width >= 1024 ? 32 : width >= 640 ? 24 : 18;
  const noteGap = width >= 720 ? 16 : 12;

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
