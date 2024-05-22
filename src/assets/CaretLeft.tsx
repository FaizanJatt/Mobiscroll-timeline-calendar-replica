interface SvgProps {
  color: string;
}

const CaretLeft = ({ color }: SvgProps) => (
  <svg
    width="11"
    height="18"
    viewBox="0 0 11 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 16.5L1.5 9L9 1.5"
      stroke={color}
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CaretLeft;
