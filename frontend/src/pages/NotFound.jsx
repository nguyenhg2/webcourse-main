import { Link } from "react-router-dom";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function NotFound() {
  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "FAQs" }]} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-semibold font-heading text-gray-900 mb-14">Error</h2>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-full max-w-2xl mx-auto mb-12">
            <div className="w-full h-[400px] bg-gradient-to-b from-indigo-50 to-white rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-[140px] h-[220px] bg-emerald-300 rounded-lg mx-auto" />

                  <div className="absolute -left-32 bottom-0 w-24 h-64 bg-gradient-to-t from-blue-800 to-blue-600 rounded-t-lg" />
                  <div className="absolute -left-16 bottom-0 w-20 h-44 bg-amber-400 rounded-t-lg" />

                  <div className="absolute -right-24 bottom-0 w-12 h-40 bg-slate-500 rounded-t-lg" />
                  <div className="absolute -right-32 bottom-8 w-32 h-9 bg-gradient-to-r from-emerald-300 to-slate-500 rounded" />

                  <div className="absolute -right-20 -top-8 w-24 h-24 bg-slate-300 rounded-full" />

                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-[400px] h-5 bg-blue-950/20 rounded-full blur-sm" />
                </div>
              </div>

              <div className="absolute top-4 right-1/4 w-40 h-20 bg-indigo-50 rounded-lg" />
              <div className="absolute top-12 left-1/3 w-40 h-20 bg-indigo-50 rounded-lg" />

              <div className="absolute bottom-16 left-8">
                <div className="w-12 h-24 bg-blue-100 rounded-t-lg" />
                <div className="w-4 h-16 bg-sky-300 rounded-t-lg mx-auto -mt-16" />
              </div>
              <div className="absolute bottom-20 left-24">
                <div className="w-7 h-14 bg-blue-100 rounded-t-lg" />
                <div className="w-2.5 h-10 bg-sky-300 rounded-t-lg mx-auto -mt-10" />
              </div>
              <div className="absolute bottom-12 right-16">
                <div className="w-11 h-20 bg-blue-100 rounded-t-lg" />
                <div className="w-3.5 h-14 bg-sky-300 rounded-t-lg mx-auto -mt-14" />
              </div>
              <div className="absolute bottom-8 right-32">
                <div className="w-12 h-24 bg-blue-100 rounded-t-lg" />
                <div className="w-4 h-16 bg-sky-300 rounded-t-lg mx-auto -mt-16" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-8xl font-bold text-primary mb-6">404</h1>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trang khong ton tai</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Xin loi, trang ban dang tim kiem khong ton tai hoac da bi di chuyen. Vui long quay lai trang chu.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition"
            >
              Quay ve trang chu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
