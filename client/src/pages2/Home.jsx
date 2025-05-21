import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Shirt, Recycle, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white shadow-md">
        <div className="text-xl font-bold text-green-700">ClothCare</div>
        <nav className="space-x-6 text-sm text-gray-700">
          <a href="#">الرئيسية</a>
          <a href="#">عن المبادرة</a>
          <a href="#">كيف تتبرع؟</a>
          <a href="#">المعرض</a>
          <a href="#">تواصل معنا</a>
          <Button className="bg-green-600 text-white px-4 py-2 rounded-xl">تبرع الآن</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-green-50 text-center py-20 px-4">
   
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            تبرع بملابسك
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            دع لقطعة الملابس قصة جديدة مع من يحتاجها
          </p>
          <Button className="bg-black text-white px-6 py-3 rounded-xl text-lg">
            تعرف أكثر
          </Button>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 text-center">
        <h2 className="text-4xl text-green-700 font-bold">50000+</h2>
        <p className="text-gray-600 mt-2">أشخاص ساهموا بالتبرع</p>
      </section>

      {/* Services */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 py-12 bg-white">
        <Card className="text-center p-6 bg-green-100">
          <CardContent>
            <Recycle size={40} className="mx-auto text-green-700 mb-4" />
            <h3 className="text-lg font-bold">إعادة التدوير</h3>
            <p className="text-sm text-gray-600 mt-2">
              نحافظ على البيئة من خلال تدوير الملابس
            </p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-green-100">
          <CardContent>
            <Shirt size={40} className="mx-auto text-green-700 mb-4" />
            <h3 className="text-lg font-bold">توزيع عادل</h3>
            <p className="text-sm text-gray-600 mt-2">
              نوصل التبرعات للأسر المحتاجة
            </p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-green-100">
          <CardContent>
            <Sparkles size={40} className="mx-auto text-green-700 mb-4" />
            <h3 className="text-lg font-bold">تنظيف وتعقيم</h3>
            <p className="text-sm text-gray-600 mt-2">
              نعالج الملابس قبل توزيعها
            </p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-green-100">
          <CardContent>
            <Leaf size={40} className="mx-auto text-green-700 mb-4" />
            <h3 className="text-lg font-bold">شراكات خيرية</h3>
            <p className="text-sm text-gray-600 mt-2">
              بالتعاون مع الجمعيات المحلية
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-black text-white py-12 px-6">
      
        <div className="md:ml-10 mt-6 md:mt-0">
          <h2 className="text-3xl font-bold mb-4">
            شارك في حملتنا وساهم بتغيير حياة إنسان
          </h2>
          <p className="text-gray-300 mb-6">
            تبرع بقطعة، وامنح أملاً.
          </p>
          <div className="space-x-4 rtl:space-x-reverse">
            <Button className="bg-green-600 text-white px-6 py-2 rounded-xl">
              تبرع الآن
            </Button>
            <Button className="bg-white text-black px-6 py-2 rounded-xl">
              عرض التفاصيل
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
