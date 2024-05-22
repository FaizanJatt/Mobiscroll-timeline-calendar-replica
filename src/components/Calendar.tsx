import Header from "./Header";
import { useEffect, useState } from "react";
import moment from "moment";
import CalendarTitle from "./CalendarTitle";
import CalendarBody from "./CalendarBody";
import { MouseEvent } from "react";

const resourceList = [
  "Resource A",
  "Resource B",
  "Resource C",
  "Resource D",
  "Resource F",
  "Resource G",
  "Resource H",
  "Resource I",
  "Resource J",
  "Resource K",
  "Resource L",
  "Resource M ",
  "Resource N",
  "Resource O",
  "Resource P",
  "Resource Q",
  "Resource R",
];

function Calendar() {
  const currentYear = moment().year();
  const [month, setMonth] = useState(0);
  console.log(month);
  const [year, setYear] = useState(currentYear);
  //   const [daysArray, setDaysArray] = useState([]);
  const [daysArray, setDaysArray] = useState<Date[]>([]); // Initialize state for the daysArray
  const [resourceListArr, setResourceListArr] =
    useState<string[]>(resourceList);

  useEffect(() => {
    calendarMonthLayoutHandler();
  }, [month, year]);

  const scrollToCurrentDay = () => {
    const dateNow = moment().date();
    const day = moment().format("ddd");
    console.log(day);
    const elements = document.querySelectorAll('[id*="dateDay"]');
    elements.forEach((element) => {
      const [_, currDate] = element.id.split("-");
      if (dateNow === parseInt(currDate)) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    });
  };

  const calendarMonthLayoutHandler = () => {
    const firstDayOfMonth = moment([year, month]);

    // Get the number of days in the month
    const daysInMonth = firstDayOfMonth.daysInMonth();
    // Initialize an empty array to store the dates
    const daysArray = [];

    // Loop through each day of the month and add it to the array
    for (let day = 1; day <= daysInMonth; day++) {
      // Create a Moment.js object representing the current day
      const currentDate = firstDayOfMonth.clone().date(day);

      // Push the current date to the array
      daysArray.push(currentDate.toDate());
      setDaysArray(daysArray);
    }
  };

  const monthYearChangeHandler = (
    currMonth: number,
    currYear: number,
    action: "back" | "forward"
  ) => {
    console.log(currMonth, currYear, action);

    if (action === "back") {
      const nextMonth = currMonth - 1 === -1 ? 11 : currMonth - 1;
      setMonth(nextMonth);
      currMonth - 1 === -1 && setYear(currYear - 1);
      console.log(nextMonth);
    } else {
      const nextMonth = currMonth + 1 === 12 ? 0 : currMonth + 1;
      currMonth + 1 === 12 && setYear(currYear + 1);

      setMonth(nextMonth);
    }
  };
  function darkenColor(color: string, factor: number) {
    // Convert color from hex to RGB
    const hex = color.replace(/^#/, "");
    const rgb = parseInt(hex, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;

    // Darken each component of the RGB color
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));

    // Convert the new RGB components back to hex
    const newHex = ((newR << 16) | (newG << 8) | newB)
      .toString(16)
      .padStart(6, "0");

    return `#${newHex}`;
  }

  const createEvent = (e: MouseEvent) => {
    const clickedElement = e.target as HTMLElement;
    const originalColor = `#${Math.floor(Math.random() * 16777215).toString(
      16
    )}`;

    if (clickedElement.id !== "cell") return;
    let eleCount = clickedElement.childElementCount;
    const parentElement =
      clickedElement.parentElement?.parentElement?.parentElement;
    if (!parentElement) return;

    const parentBoundingRect = parentElement.getBoundingClientRect();
    const clickedBoundingRect = clickedElement.getBoundingClientRect();
    if (eleCount > 0) {
      const firstChild = clickedElement.firstElementChild;
      if (firstChild) {
        clickedBoundingRect.width = firstChild.clientWidth;
        clickedBoundingRect.height = firstChild.clientHeight;
      }
    }

    // Calculate the offset of the clicked element within its parent container
    const offsetX = clickedBoundingRect.left - parentBoundingRect.left;
    const offsetY = clickedBoundingRect.top - parentBoundingRect.top;

    // Calculate the scroll position of the parent container
    const scrollX = parentElement.scrollLeft;
    const scrollY = parentElement.scrollTop;

    // Calculate the position of the rectangle relative to the parent container
    const x = offsetX + scrollX;
    const y = offsetY + scrollY;

    // Create a new div element for the rectangle
    const newDiv = document.createElement("div");
    // newDiv.style.position = "absolute";
    newDiv.style.left = `${x}px`;
    newDiv.style.top = `${y}px`;

    if (eleCount > 0) {
      newDiv.style.width = `${clickedBoundingRect.width}px`;
      newDiv.style.height = `${clickedBoundingRect.height}px`;
    } else {
      newDiv.style.width = `${78}px`;
      newDiv.style.height = `${39}px`;
    }
    newDiv.style.borderRadius = `6px`;

    newDiv.style.backgroundColor = originalColor;

    clickedElement.classList.add(
      "flex",
      "justify-center",
      "items-center",
      "flex-col"
    );

    const newHeight = eleCount > 0 ? 54 * (eleCount + 1) : 54;

    const firstChildOfParent = clickedElement.parentElement?.firstChild;
    if (
      firstChildOfParent instanceof HTMLElement &&
      newHeight > firstChildOfParent.clientHeight
    ) {
      firstChildOfParent.style.height = `${newHeight}px`;
    }
    newDiv.addEventListener("mouseenter", () => {
      // Darken the original color
      const darkenFactor = 0.2;
      const hoverColor = darkenColor(originalColor, darkenFactor);
      newDiv.style.backgroundColor = hoverColor; // Set the darker color on hover
      newDiv.style.cursor = "pointer"; // Set the darker color on hover
    });

    newDiv.addEventListener("mouseleave", () => {
      newDiv.style.backgroundColor = originalColor; // Restore the original color on mouse leave
    });
    newDiv.addEventListener("mousedown", (e) => {
      // newDiv
      console.log("ondrag", e);
      newDiv.style.width = `${clickedBoundingRect.width}px`;
    });

    const title = document.createElement("div");
    title.innerText = "New event";
    const time = document.createElement("div");

    time.classList.add("text-xs");

    time.innerText = "12:00 AM - 12:00 AM";
    newDiv.appendChild(title);
    newDiv.appendChild(time);
    newDiv.classList.add("opacity-60", "overflow-hidden");

    clickedElement.appendChild(newDiv);
  };

  return (
    <div className="flex flex-col">
      <div className="h-12">
        <Header
          monthYearChangeHandler={monthYearChangeHandler}
          month={month}
          year={year}
          scrollToCurrentDay={scrollToCurrentDay}
        />
      </div>
      <CalendarTitle daysArray={daysArray} />
      <CalendarBody
        createEvent={createEvent}
        resourceList={resourceListArr}
        daysArray={daysArray}
      />
    </div>
  );
}

export default Calendar;
