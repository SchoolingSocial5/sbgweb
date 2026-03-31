"use client";
import Image from "next/image";
import Link from "next/link";

const DownloadApp: React.FC = () => {
  return (
    <>
      <div className="title">Download the App</div>
      <div className="flex items-center">
        <Link href="/" className="mx-3">
          <Image
            className="h-auto"
            width={150}
            height={0}
            src="/images/logos/android.png"
            alt=""
            sizes="100vw"
          />
        </Link>
        <Link href="/" className="mx-3">
          <Image
            className="h-auto"
            width={150}
            height={0}
            src="/images/logos/apple.png"
            alt=""
            sizes="100vw"
          />
        </Link>
      </div>
      <div>OR</div>
    </>
  );
};

export default DownloadApp;
