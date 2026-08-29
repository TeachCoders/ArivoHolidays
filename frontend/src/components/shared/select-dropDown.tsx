import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectDropDownProps {
  data: {
    label: string;
    value: string;
  }[];
  placeholderText: string;
  selectedValue: string;
  onChangeHandler: (value: string) => void;
}

export function SelectDropDown({
  data,
  placeholderText,
  selectedValue,
  onChangeHandler,
}: SelectDropDownProps) {
  return (
    <Select value={selectedValue} onValueChange={onChangeHandler} >
      <SelectTrigger className="w-full bg-white px-5 py-5 text-sm rounded">
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
            {data.map((item, index) => (
              <SelectItem
                key={index}
                value={item.value}
                className="text-black"
              >
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}