import * as React from "react";

interface TitleBorderProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  strokeWidth?: number;
}

const TitleBorder: React.FC<TitleBorderProps> = ({
  color = "#FE296A",
  strokeWidth = 3,
  className = "opacity-[.8]",
  width = 114,
  height = 35,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 114 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M112 23.275C1.84952 -10.6834 -7.36586 1.48086 7.50443 32.9053"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TitleBorder;


