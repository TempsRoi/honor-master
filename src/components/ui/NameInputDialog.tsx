"use client";

import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';

interface NameInputDialogProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
  initialName?: string;
  title?: string;
  description?: string;
  submitButtonText?: string;
}

export const NameInputDialog = ({
  isOpen,
  onSubmit,
  onClose,
  initialName,
  title = 'Welcome!',
  description = 'Please set your display name to continue.',
  submitButtonText = 'Save Name',
}: NameInputDialogProps) => {
  const [name, setName] = useState(initialName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mb-4"
            required
          />
          <Button type="submit" className="w-full">
            {submitButtonText}
          </Button>
        </form>
      </div>
    </div>
  );
};
