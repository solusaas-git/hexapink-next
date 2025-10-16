"use client";

import { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { LuPlus } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import Spinner from "@/components/common/ui/Spinner";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export default function TagSelector({
  selectedTags,
  onChange,
  disabled = false,
}: TagSelectorProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/tags");
      setAllTags(response.data.map((tag: any) => tag.name));
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tagName: string) => {
    if (disabled) return;
    
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    if (allTags.includes(newTagName.trim())) {
      toast.error("Tag already exists");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/tags", { name: newTagName.trim() });
      const updatedTags = [...allTags, newTagName.trim()].sort();
      setAllTags(updatedTags);
      onChange([...selectedTags, newTagName.trim()]);
      setNewTagName("");
      setShowInput(false);
      toast.success("Tag created successfully");
    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast.error(error.response?.data?.message || "Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (e: React.MouseEvent, tagName: string) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This will remove it from all tables.`)) {
      return;
    }

    try {
      await api.delete(`/admin/tags?name=${encodeURIComponent(tagName)}`);
      setAllTags(allTags.filter((t) => t !== tagName));
      onChange(selectedTags.filter((t) => t !== tagName));
      toast.success("Tag deleted successfully");
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      toast.error(error.response?.data?.message || "Failed to delete tag");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" color="#4040BF" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-md text-light-dark font-medium">Tags</label>
        {selectedTags.length > 0 && (
          <span className="px-2 py-0.5 bg-dark-blue text-white text-xs rounded-full font-medium">
            {selectedTags.length}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isHovered = hoveredTag === tag;
          
          return (
            <div
              key={tag}
              className="relative"
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              <button
                type="button"
                onClick={() => handleToggleTag(tag)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                  isSelected
                    ? "border-dark-blue bg-dark-blue text-white"
                    : "border-light-gray-3 text-dark hover:border-dark-blue"
                }`}
              >
                {tag}
              </button>
              
              {isHovered && !disabled && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteTag(e, tag)}
                  className="absolute -top-2 -right-2 bg-red text-white rounded-full p-1 hover:bg-opacity-80 transition-all shadow-md"
                >
                  <BsTrash3 className="text-xs" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add New Tag Button */}
        {!disabled && !showInput && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="px-3 py-1.5 rounded-full border-2 border-dashed border-light-gray-3 text-dark-blue text-sm hover:border-dark-blue transition-all flex items-center gap-1"
          >
            <LuPlus className="text-lg" />
            <span>New Tag</span>
          </button>
        )}

        {/* New Tag Input */}
        {showInput && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-dark-blue bg-white">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                } else if (e.key === "Escape") {
                  setShowInput(false);
                  setNewTagName("");
                }
              }}
              placeholder="Tag name..."
              className="outline-none text-sm w-32"
              autoFocus
              disabled={creating}
            />
            {creating ? (
              <Spinner size="sm" color="#4040BF" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="text-dark-blue hover:opacity-70"
                >
                  <LuPlus className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInput(false);
                    setNewTagName("");
                  }}
                  className="text-red hover:opacity-70"
                >
                  <IoCloseSharp className="text-lg" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

