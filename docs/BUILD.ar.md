# WAR LORDS — تطبيق أندرويد

التطبيق كيفتح الموقع الحي `https://war-lords.web.app` داخل نافذة كاملة (WebView)، بنفس الحساب ونفس القاعدة. ما فيهش نسخة ديال الموقع داخلو، داكشي علاش كيبقى ديما متزامن معاه.

## جوج تحديثات أوتوماتيكية
1. **تحديث الموقع (الأكثر):** أي `deploy.bat` كيبان فالتطبيق مباشرة. إلا رجع اللاعب للتطبيق من بعد 20 دقيقة أو كثر، التطبيق كيشوف واش الموقع تبدّل ويعاود يحمّلو بوحدو.
2. **تحديث التطبيق نفسو (نادر):** التطبيق كيقرا `https://war-lords.web.app/app/version.json`. إلا لقى `versionCode` أكبر من ديالو، كيقترح «حدّث دابا» وكيحمّل الـ APK من الرابط `apkUrl` ويثبّتو. (أول مرة أندرويد كيطلب «السماح بتثبيت التطبيقات من هاد المصدر»، مرة وحدة.)

هادشي كيعني: تعديلات الموقع **ما كتحتاجش** بناء APK جديد. الـ APK كيتعاود غير إلا تبدّل شي حاجة فهاد المجلد.

## البناء (على PC، مرة الأولى)
1. ثبّت **Android Studio** (https://developer.android.com/studio) وحلّو مرة وحدة باش يكمّل تحميل الـ SDK.
2. حط هاد المجلد فـ `E:\WAR LORDS\ANDROID APP` (حدا `WEB APP Hosting`).
3. شغّل `build-apk.bat`. أول مرة كيصاوب مفتاح التوقيع `war-lords.jks` + `keystore.properties`.
   **دير ليهم نسخة احتياطية** — بلا بيهم حتى تحديث ما غادي يتثبّت فوق القديم.
4. السكريبت كيحط `war-lords.apk` فـ `ANDROID APP\release\`، و `version.json` فـ `WEB APP Hosting\public\app\`.
5. خطة Spark ديال Firebase كتمنع ملفات `.apk`. داكشي علاش كترفع `release\war-lords.apk` لـ GitHub Releases (الرابط فـ `apkUrl` ف `version.properties`).
6. شغّل `deploy.bat` فـ `WEB APP Hosting` باش يتنشر `version.json`.

## تحديث التطبيق من بعد
- بدّل الكود هنا، زيد `versionCode` بـ 1 فـ `version.properties` (و `versionName` إلا بغيتي)، واختياريا `notes=...` (نص كيبان فنافذة التحديث).
- `build-apk.bat`، رفع `release\war-lords.apk` لـ GitHub Release جديد، ومن بعد `deploy.bat`. التطبيقات المثبتة كتشوف التحديث بوحدها.
- `"force": true` فـ `version.json` كيخلّي التحديث إجباري (بلا زر «من بعد»).

## من داخل الموقع
- الموقع كيعرف راسو فالتطبيق: `window.WarLordsApp` موجود، و User-Agent فيه `WarLordsAndroid/1.0`.
- `WarLordsApp.version()` ، `WarLordsApp.checkUpdate()` (يفرض فحص التحديث).
- ملفات التصدير (نسخ احتياطية JSON…) كتسجّل فـ **التنزيلات** فالتليفون.
- الروابط اللي برا الموقع (واتساب، يوتيوب…) كتحل فالتطبيق ديالها.

## Firebase
التطبيق ما كيحتاجش `google-services.json`: Firebase خدام من داخل الموقع (Web SDK + دخول مجهول). الـ Android app `com.app.war_lords` اللي مسجّل فالكونسول كيبقى مفيد إلا بغيتي من بعد إشعارات (FCM) أو Play Store.
