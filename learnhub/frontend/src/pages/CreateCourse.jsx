import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PlusCircle, Upload, Link as LinkIcon, X, Image } from 'lucide-react';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'web',
    price: 0,
    meetLink: ''
  });
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, thumbnail: '' }));
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      toast.success('Course created successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <PlusCircle className="mr-2 text-indigo-600 dark:text-indigo-400" /> Create New Course
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Title</label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            required
            rows="4"
            className="mt-1 block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Thumbnail
          </label>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setImageMode('upload'); clearImage(); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                imageMode === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
            <button
              type="button"
              onClick={() => { setImageMode('url'); clearImage(); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                imageMode === 'url'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Image URL
            </button>
          </div>

          {/* Upload Mode */}
          {imageMode === 'upload' && (
            <>
              {!previewUrl ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Image className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Drag & drop an image here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={clearImage}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    ✓ Image ready
                  </div>
                </div>
              )}
            </>
          )}

          {/* URL Mode */}
          {imageMode === 'url' && (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://example.com/course-image.jpg"
                className="block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.thumbnail}
                onChange={(e) => {
                  setFormData({...formData, thumbnail: e.target.value});
                  setPreviewUrl(e.target.value);
                }}
              />
              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={() => setPreviewUrl('')}
                  />
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    ✓ Preview loaded
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              className="mt-1 block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="web">Web Development</option>
              <option value="data">Data Science</option>
              <option value="design">Design</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
            <input
              type="number"
              min="0"
              className="mt-1 block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
        </div>

        {/* Meet Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Meet Link (Optional)</label>
          <input
            type="text"
            className="mt-1 block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.meetLink}
            onChange={(e) => setFormData({...formData, meetLink: e.target.value})}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md transition font-bold text-lg shadow-md hover:shadow-indigo-500/40"
        >
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
