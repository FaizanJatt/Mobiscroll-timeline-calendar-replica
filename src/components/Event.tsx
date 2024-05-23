import React, { useEffect, useRef, useState } from "react";
import moment from "moment";

interface EventData {
  title: string;
  startTime: Date;
  endTime: Date;
  originalColor: string;
  hoverColor: string;
  darkestColor: string;
}

interface EventProps {
  eventData: EventData;
  dayIndex: number;
  totalContainerWidth: number;
  onUpdateEvent: (updatedEvent: EventData) => void;
}

const formatTime = (date: Date) => {
  return moment(date).format("hh:mm A");
};

function Event({
  eventData,
  onUpdateEvent,
  dayIndex,
  totalContainerWidth,
}: EventProps) {
  const [eventWidth, setEventWidth] = useState(0);
  const isResizing = useRef<Boolean>(false);
  const startTime = useRef<Date>();
  const endTime = useRef<Date>();
  const [hoverState, setHoverState] = useState<Boolean>(false);
  const [eventTimeState, setEventTimeState] = useState(
    `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`
  );
  const [selected, setSelected] = useState(false);
  const eventRef = useRef<HTMLDivElement | null>(null);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [leftOffset, setLeftOffset] = useState(0); // New state to track left offset

  useEffect(() => {
    calculateInitialEventWidth();
  }, []);

  const calculateInitialEventWidth = () => {
    const totalMinutesInDay = 24 * 60;
    const startDate = moment(eventData.startTime).startOf("day");
    const endDate = moment(eventData.endTime).startOf("day");
    const numDays = endDate.diff(startDate, "days") + 1;
    let startMinutes =
      eventData.startTime.getHours() * 60 + eventData.startTime.getMinutes();
    let endMinutes =
      eventData.endTime.getHours() * 60 + eventData.endTime.getMinutes();
    const eventDurationMinutes =
      (numDays - 1) * totalMinutesInDay + (endMinutes - startMinutes);
    const widthPixels =
      (eventDurationMinutes / totalMinutesInDay) * totalContainerWidth +
      (numDays - 1);
    setEventWidth(Math.max(widthPixels, 20));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const threshold = 10;
    const rect = eventRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < threshold) {
      setIsResizingLeft(true);
    } else if (x > rect.width - threshold) {
      setIsResizingLeft(false);
    } else {
      return;
    }

    isResizing.current = true;
    setSelected(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !eventRef.current) return;

    const rect = eventRef.current.getBoundingClientRect();
    const totalMinutesInDay = 24 * 60;
    const minutesPerPixel = totalMinutesInDay / totalContainerWidth;

    if (isResizingLeft) {
      const newLeft = Math.min(e.clientX, rect.right - 20);
      const newWidth = rect.right - newLeft;

      setEventWidth(newWidth);

      const newStartMinutes =
        eventData.startTime.getHours() * 60 +
        eventData.startTime.getMinutes() +
        Math.round((rect.left - newLeft) * minutesPerPixel);

      const newStartTime = new Date(eventData.startTime);
      newStartTime.setHours(Math.floor(newStartMinutes / 60));
      newStartTime.setMinutes(newStartMinutes % 60);

      const newEndTime = new Date(eventData.endTime); // Keep the original end time
      startTime.current = newStartTime;
      endTime.current = newEndTime;
      setEventTimeState(
        `${formatTime(newStartTime)} - ${formatTime(newEndTime)}`
      );
    } else {
      const newWidth = Math.max(e.clientX - rect.left, 20);
      setEventWidth(newWidth);

      const newEventDurationMinutes = Math.round(newWidth * minutesPerPixel);
      const newStartMinutes =
        eventData.startTime.getHours() * 60 + eventData.startTime.getMinutes();
      const newEndMinutes = newStartMinutes + newEventDurationMinutes;

      const newStartTime = new Date(eventData.startTime); // Keep the original start time
      const newEndTime = new Date(eventData.startTime);
      newEndTime.setHours(Math.floor(newEndMinutes / 60));
      newEndTime.setMinutes(newEndMinutes % 60);
      startTime.current = newStartTime;
      endTime.current = newEndTime;
      setEventTimeState(
        `${formatTime(newStartTime)} - ${formatTime(newEndTime)}`
      );
    }
  };

  const handleMouseUp = () => {
    if (startTime.current && endTime.current) {
      onUpdateEvent({
        ...eventData,
        startTime: startTime.current,
        endTime: endTime.current,
      });
    }
    startTime.current = undefined;
    endTime.current = undefined;
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const mouseMoveHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const threshold = 10;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isNearLeftEdge = x < threshold;
    const isNearRightEdge = x > rect.width - threshold;

    e.currentTarget.style.cursor =
      isNearLeftEdge || isNearRightEdge ? "ew-resize" : "default";
  };

  const innerHoverHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const threshold = 10;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isNearLeftEdge = x < threshold;
    const isNearRightEdge = x > rect.width - threshold;
    e.currentTarget.style.cursor =
      isNearLeftEdge || isNearRightEdge ? "pointer" : "default";
  };

  return (
    <div
      ref={eventRef}
      style={{
        width: `${eventWidth}px`,
        backgroundColor: selected
          ? eventData.darkestColor
          : hoverState
          ? eventData.hoverColor
          : eventData.originalColor,
      }}
      onMouseEnter={() => setHoverState(true)}
      onMouseMove={mouseMoveHandler}
      onMouseLeave={() => setHoverState(false)}
      onClick={() => setSelected(true)}
      className={`h-10 relative  flex justify-start items-start  overflow-hidden rounded-md hover:opacity-100 `}
      onMouseDown={handleMouseDown}
    >
      <div
        onMouseEnter={innerHoverHandler}
        className={`p-1  text-xs text-nowrap pointer-events-none font-bold ${
          selected ? "text-white" : "text-black"
        }`}
      >
        {eventData.title}
        <br />
        <p className="text-[0.625rem]">{eventTimeState}</p>
      </div>
    </div>
  );
}

export default Event;
