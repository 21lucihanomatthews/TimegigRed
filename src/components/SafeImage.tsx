import { useState, ElementType } from 'react';
import { ImageOff } from 'lucide-react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
  as?: ElementType;
}

export default function SafeImage({ src, alt, className, fallbackClassName, as: Component = 'img', ...props }: Props) {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded ${className} ${fallbackClassName}`}>
        <ImageOff className="w-6 h-6 mb-1 opacity-50" />
        <span className="text-[10px] uppercase font-medium tracking-tight">Image not available</span>
      </div>
    );
  }

  return (
    <Component
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsError(true)}
      {...props}
    />
  );
}
