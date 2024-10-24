import { useMemo } from 'react';

const getIconComponent = (icon: string) => {
  if (!icon) return null;
  const req = require.context('!@svgr/webpack!svgs/', false, /\.svg$/);
  return req(`./${icon}.svg`).default as React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
};

export const useSvgIcon = (icon: string) => {
  const SvgIcon = useMemo(() => {
    return getIconComponent(icon);
  }, [icon]);

  return { SvgIcon };
};

export const useSvgIconList = (icons: string[]) => {
  const iconComponents = useMemo(
    () => icons.map(icon => getIconComponent(icon)),
    [icons]
  );

  return iconComponents;
};

export default useSvgIcon;
