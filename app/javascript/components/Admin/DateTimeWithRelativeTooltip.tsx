import React from "react";
import { WithTooltip } from "$app/components/WithTooltip";
import { formatDistanceToNow } from 'date-fns';
import { formatDate } from "$app/utils/date";

type Props = {
  date: string;
  placeholder?: string | React.ReactNode;
  utc?: boolean;
};

const DateTimeWithRelativeTooltip = ({ date, placeholder, utc }: Props) => {
  if (!date) return placeholder;

  const relativeTime = formatDistanceToNow(new Date(date), { addSuffix: true });
  const formattedDate = utc ?
    `${formatDate(new Date(date), { timeZone: "UTC" })} UTC` :
    formatDate(new Date(date));

  return <WithTooltip tip={relativeTime}>{formattedDate}</WithTooltip>;
};

export default DateTimeWithRelativeTooltip;
