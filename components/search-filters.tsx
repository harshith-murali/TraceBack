import { Search } from "lucide-react";
import { categories, campusAreas, postStatuses, postTypes, sortOptions } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function SearchFilters({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const value = (key: string) => {
    const item = searchParams[key];
    return Array.isArray(item) ? item[0] ?? "" : item ?? "";
  };

  return (
    <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.5fr_repeat(5,1fr)_auto]" action="/posts">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={value("q")} placeholder="Search item, description, location" className="pl-9" />
      </div>
      <Select name="type" defaultValue={value("type")}>
        <option value="">Any type</option>
        {postTypes.map((type) => (
          <option key={type} value={type}>
            {type.toLowerCase()}
          </option>
        ))}
      </Select>
      <Select name="category" defaultValue={value("category")}>
        <option value="">Any category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {formatCategory(category)}
          </option>
        ))}
      </Select>
      <Select name="status" defaultValue={value("status")}>
        <option value="">Any status</option>
        {postStatuses.map((status) => (
          <option key={status} value={status}>
            {status.toLowerCase()}
          </option>
        ))}
      </Select>
      <Select name="campusArea" defaultValue={value("campusArea")}>
        <option value="">Any area</option>
        {campusAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </Select>
      <Select name="sort" defaultValue={value("sort") || "newest"}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Button type="submit">Filter</Button>
    </form>
  );
}
