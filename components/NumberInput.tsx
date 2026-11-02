"use client";

import { useEffect, useState } from "react";

type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement>;

// A number field that lets you fully clear it while editing.
// Forms keep a numeric value in state (an empty field becomes 0), which would
// otherwise snap the "0" back into the box the moment you delete it. This keeps
// the text you typed locally and only follows the parent value when it changes
// to something different (e.g. auto-filled from a selected truck).
export default function NumberInput({ value, onChange, ...props }: NumberInputProps) {
  const [text, setText] = useState(value === undefined ? "" : String(value));

  useEffect(() => {
    if (value === undefined) return;
    setText((current) => (Number(current || 0) === Number(value) ? current : String(value)));
  }, [value]);

  if (value === undefined) {
    return <input {...props} type="number" onChange={onChange} />;
  }

  return (
    <input
      {...props}
      type="number"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange?.(e);
      }}
    />
  );
}
