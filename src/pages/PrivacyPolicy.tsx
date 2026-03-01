
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-primary">سياسة الخصوصية</h1>
          <Link to="/auth">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span>العودة لصفحة التسجيل</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </header>

        <main className="space-y-8">
          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">مقدمة</h2>
            <p className="text-card-foreground/80">
              أهلاً بك في "الرياضي الذكي". نحن نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.
            </p>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">المعلومات التي نجمعها</h2>
            <p className="text-card-foreground/80">
              نحن نجمع المعلومات التي تقدمها عند التسجيل، مثل اسمك وبريدك الإلكتروني. كما قد نجمع بيانات حول كيفية استخدامك للمنصة لتحسين خدماتنا.
            </p>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">كيف نستخدم معلوماتك</h2>
            <ul className="space-y-2 list-disc list-inside text-card-foreground/80">
              <li>تخصيص تجربتك على المنصة.</li>
              <li>التواصل معك بشأن التحديثات أو العروض.</li>
              <li>تحليل الاستخدام لتحسين وتطوير خدماتنا.</li>
              <li>ضمان أمان وحماية حسابك.</li>
            </ul>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">مشاركة المعلومات</h2>
            <p className="text-card-foreground/80">
              نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. قد نشاركها مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة، مع التزامهم بالحفاظ على سريتها.
            </p>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">أمان البيانات</h2>
            <p className="text-card-foreground/80">
              نحن نستخدم تدابير أمنية متقدمة لحماية معلوماتك من الوصول غير المصرح به. ومع ذلك، لا يمكن ضمان أمان أي نظام بنسبة 100%، لكننا نسعى باستمرار لتطبيق أفضل الممارسات.
            </p>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">التغييرات على السياسة</h2>
            <p className="text-card-foreground/80">
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على المنصة.
            </p>
          </section>

          <section className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">اتصل بنا</h2>
            <p className="text-card-foreground/80">
              إذا كانت لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:privacy@smart-sports.com" className="text-primary hover:underline">privacy@smart-sports.com</a>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
