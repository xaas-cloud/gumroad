import * as React from "react";

import { buttonVariants } from "$app/components/Button";
import { Icon } from "$app/components/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "$app/components/Popover";

type SearchProps = {
  onSearch: (query: string) => void;
  value: string;
  placeholder?: string;
};

export const Search = ({ onSearch, value, placeholder = "Search" }: SearchProps) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Popover>
      <PopoverTrigger className={buttonVariants()}>
        <Icon name="solid-search" />
      </PopoverTrigger>
      <PopoverContent sideOffset={4} onOpenAutoFocus={() => searchInputRef.current?.focus()}>
        <div className="input input-wrapper">
          <Icon name="solid-search" />
          <input
            ref={searchInputRef}
            value={value}
            autoFocus
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
