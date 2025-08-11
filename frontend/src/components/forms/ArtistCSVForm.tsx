import React, { useRef, useState } from "react";
import axios from "axios";
import { File, FilePlus, Upload, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Button } from "../ui/button";

const ArtistCSVForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrors(["Please select a CSV file."]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setErrors([]);
      const res = await apiRequest.post("/artist/upload-csv/", formData);

      if (res.data.errors && Array.isArray(res.data.errors)) {
        setErrors(res.data.errors);
      } else {
        setFile(null);
      }
    } catch (error: any) {
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        const errorList = detail.split("\n").filter(Boolean);
        setErrors(errorList);
      } else {
        setErrors(["An unexpected error occurred while uploading."]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 flex flex-col justify-end"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make sure your CSV file has the required columns
          </label>
        </div>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        {file && (
          <div className="flex justify-between items-center border border-black-500 text-black-500 rounded-lg p-2">
            <p className="text-sm flex gap-2 items-center">
              <File size={14} /> {file.name}
            </p>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setErrors([]);
              }}
              className=" text-black hover:text-blue-500 cursor-pointer rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {!file && (
          <Button
            variant="outline"
            className="bg-white flex items-center justify-center gap-1 text-black mt-1"
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <FilePlus size={15} />
            Add File
          </Button>
        )}
        {errors.length > 0 && (
          <div className="mt space-y-2">
            <p className="text-red-700 text-xs">
              Your file has the following errors:
            </p>
            {errors.map((err, i) => (
              <div
                key={i}
                className="px-3 py-2 border border-red-400 bg-red-50 text-red-700 rounded-lg text-sm"
              >
                {err}
              </div>
            ))}
          </div>
        )}
        <Button type="submit" disabled={isUploading} className="ml-auto">
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default ArtistCSVForm;
