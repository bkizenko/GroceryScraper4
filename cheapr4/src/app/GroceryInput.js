import { useState } from "react";

export default function GroceryInput({ onSubmit }) {
  const [groceryList, setGroceryList] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const groceries = groceryList.split("\n").map(item => item.trim()).filter(item => item);
    onSubmit(groceries);
    setGroceryList("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={groceryList}
        onChange={(e) => setGroceryList(e.target.value)}
        placeholder="Enter grocery items, one per line"
        rows="10"
        cols="30"
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
}