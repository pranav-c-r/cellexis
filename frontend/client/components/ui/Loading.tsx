import { Html, useProgress } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="text-white w-[200px] relative z-50 text-lg font-semibold flex flex-col justify-center items-center">
        <svg className="animate-spin h-6 w-6 mb-2 text-cyan-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <div className="">
          {Math.floor(progress)}% Loading 3D Model...
        </div>
      </div>
    </Html>
  );
}