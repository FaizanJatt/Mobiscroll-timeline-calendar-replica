import moment from "moment";
import CaretLeft from "../assets/CaretLeft";

interface HeaderProps {
  month: number;
  year: number;
  monthYearChangeHandler: (
    month: number,
    year: number,
    action: "back" | "forward"
  ) => void;
  scrollToCurrentDay: () => void;
}

function Header({
  month,
  year,
  monthYearChangeHandler,
  scrollToCurrentDay,
}: HeaderProps) {
  const selectedMonth = moment().set("month", month).format("MMMM");
  return (
    <div className="z-10 flex justify-between p-2  w-full bg-[#f2f2f7] fixed left-0 ">
      <div className="flex gap-2 text-blue-500 text-2xl hover:text-blue-400">
        <p>{selectedMonth}</p>
        <p>{year}</p>
      </div>
      <div className="flex justify-center items-center gap-3">
        <div
          className="hover:opacity-60"
          onClick={() => monthYearChangeHandler(month, year, "back")}
        >
          <CaretLeft color="#3b82f6" />
        </div>
        <div
          onClick={() => scrollToCurrentDay()}
          className="text-blue-500 hover:text-blue-400"
        >
          Today
        </div>
        <div
          className="rotate-180 hover:opacity-60"
          onClick={() => monthYearChangeHandler(month, year, "forward")}
        >
          <CaretLeft color="#3b82f6" />
        </div>
      </div>
    </div>
  );
}

export default Header;
