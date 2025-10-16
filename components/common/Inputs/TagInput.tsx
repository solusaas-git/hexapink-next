"use client";

import React, { useState } from "react";
import {
  Autocomplete,
  Badge,
  createFilterOptions,
  TextField,
  Tooltip,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import { TagOption } from "../../../types";

interface TagInputProps {
  tags: TagOption[];
  existingTags: TagOption[];
  setTags: React.Dispatch<React.SetStateAction<TagOption[]>>;
}

const filter = createFilterOptions<TagOption>();

export const TagInput: React.FC<TagInputProps> = ({
  existingTags,
  tags,
  setTags,
}) => {
  const [newTag, setNewTag] = useState<TagOption | null>(null);

  const handleNewTag = (tag: TagOption) => {
    if (!tags.some((t) => t.name === tag.name)) {
      setTags([...tags, tag]);
    }
    setNewTag(null); // Clear the input after adding the tag
  };

  const handleDeleteTag = (tagToDelete: TagOption) => {
    setTags(tags.filter((tag) => tag.name !== tagToDelete.name));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && newTag) {
      handleNewTag(newTag);
      event.preventDefault(); // Prevent form submission if inside a form
    }
  };

  return (
    <div className="w-full bg-white border border-light-gray-3 rounded-lg p-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-light-gray-1 rounded-full px-2 gap-2"
          >
            <span>{tag.name}</span>
            <div className="flex items-center gap-1">
              <Tooltip title="Delete Tag">
                <Badge>
                  <IoClose
                    onClick={() => handleDeleteTag(tag)}
                    className="cursor-pointer"
                  />
                </Badge>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-start">
        <Autocomplete
          value={newTag}
          onChange={(_, newValue) => {
            if (newValue && typeof newValue !== "string") {
              setNewTag(newValue);
            } else if (typeof newValue === "string") {
              setNewTag({ name: newValue });
            }
          }}
          onKeyDown={handleKeyDown} // Add the onKeyDown handler
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            const { inputValue } = params;
            const isExisting = options.some(
              (option) => inputValue === option.name
            );
            if (inputValue !== "" && !isExisting) {
              filtered.push({
                inputValue,
                name: `Add "${inputValue}"`,
              });
            }
            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="free-solo-with-text-demo"
          options={existingTags}
          autoFocus
          size="small"
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            if (option.inputValue) return option.inputValue;
            return option.name;
          }}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                {option.name}
              </li>
            );
          }}
          sx={{ width: 300 }}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="Input tag name" />
          )}
        />
      </div>
    </div>
  );
};
