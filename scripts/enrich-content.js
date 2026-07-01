const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, '../src/content/volume1/tr.json');
const enPath = path.join(__dirname, '../src/content/volume1/en.json');

const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// 1. Resolve Summary Redundancy
tr.chapters['summary'].title = "Başlangıç: Yaşayan Bir Hafıza";
tr.chapters['summary'].draft.sections[0].heading = "Başlangıç";
tr.chapters['summary'].draft.sections[0].paragraphs = [
  "Bu White Paper, yapay zekâ çağında insan zihni ve dijital araçlar arasındaki ilişkinin nasıl yeniden kurulabileceğini araştırıyor.",
  "Günümüzde zekâ her yerde bulunabilir hale geliyor. Ancak bu zekânın üzerinde çalışacağı asıl insani bağlam, anılar, kararlar ve niyetler günden güne daha fazla parçalanıyor.",
  "Saule'nin vizyonu, teknolojiyi daha fazla zeki yapmak değil; insanı, ekipleri ve toplulukları zaman içinde anlayan ve onların kurumsal, kişisel hafızasını koruyan bir katman inşa etmektir.",
  "Zekâ bir araçtır. Hafıza ise kimliğin ta kendisidir."
];

en.chapters['summary'].title = "Prologue: A Living Memory";
en.chapters['summary'].draft.sections[0].heading = "Prologue";
en.chapters['summary'].draft.sections[0].paragraphs = [
  "This White Paper explores how the relationship between the human mind and digital tools can be rebuilt in the age of artificial intelligence.",
  "Intelligence is becoming ubiquitous today. However, the human context, memories, decisions, and intentions upon which this intelligence operates are becoming increasingly fragmented.",
  "Saule's vision is not to make technology more intelligent, but to build a layer that understands individuals, teams, and communities over time, preserving their personal and collective memory.",
  "Intelligence is a tool. Memory is identity itself."
];

// 2. Enrich Chapter 3 (ai-illusion)
tr.chapters['ai-illusion'].draft.sections[0].paragraphs.push(
  "Bugünün yapay zekâ asistanları, bizimle girdikleri her yeni diyalogda aslında sıfırdan başlarlar. Bizi tanımazlar, geçmişimizi bilmezler ve kararlarımızın arkasındaki asıl niyetleri hatırlamazlar.",
  "Bu durum, yapay zekâyı bir ortak değil, sadece her seferinde yeniden talimat verilmesi gereken hızlı bir asistan konumuna indirger.",
  "Gerçek bir 'Yaşayan Hafıza', sizin düşünce yapınızı, değerlerinizi ve çalışma biçiminizi öğrenir. Bağlamın modele kilitlenmesi yerine, size ait bir bellek katmanında özgürce var olması gerekir."
);
en.chapters['ai-illusion'].draft.sections[0].paragraphs.push(
  "Today's AI assistants essentially start from scratch in every new dialogue they have with us. They don't know us, they don't know our past, and they don't remember the true intentions behind our decisions.",
  "This reduces AI not to a partner, but to a fast assistant that needs to be instructed again every single time.",
  "A true 'Living Memory' learns your way of thinking, your values, and your working style. Instead of locking context into a specific model, it must exist freely in a memory layer that belongs to you."
);

// 3. Enrich Chapter 8 (collective-memory)
tr.chapters['collective-memory'].draft.sections[0].paragraphs.push(
  "Ekipler büyüdükçe, bireysel hafızanın yetersiz kaldığı bir noktaya ulaşılır. Kararlar neden alındı? Hangi varsayımlar geçerliydi? Hangi alternatifler reddedildi?",
  "Kolektif bellek sadece bir doküman arşivi değildir. Kararların, tartışmaların ve niyetlerin organik bir şekilde birbirine bağlandığı bir yapıdır.",
  "Saule, ekipler içindeki örtük bilgiyi yakalayarak, onu gerektiği anda doğru kişiye, doğru bağlamla sunan aktif bir kurumsal hafıza gibi davranır."
);
en.chapters['collective-memory'].draft.sections[0].paragraphs.push(
  "As teams grow, a point is reached where individual memory is no longer sufficient. Why were decisions made? What assumptions were valid? Which alternatives were rejected?",
  "Collective memory is not just a document archive. It is a structure where decisions, discussions, and intentions are organically connected to one another.",
  "Saule acts as an active organizational memory by capturing implicit knowledge within teams and presenting it to the right person with the right context exactly when needed."
);

// 4. Enrich Chapter 10 (workspace-model)
tr.chapters['workspace-model'].draft.sections[0].paragraphs.push(
  "Mevcut çalışma alanları statik klasörler ve sayfalardan ibarettir. Bilgi orada durur ve sizin onu bulmanızı bekler.",
  "Saule'nin çalışma alanı modeli ise dinamiktir. Siz çalışırken sizinle birlikte evrilir. Açık döngüleri kapatmanıza yardımcı olur, tıkanıklıkları fark eder ve dikkatinizi korur.",
  "Bu, sadece veriyi değil, süreci ve çalışma halini (state of work) de hafızada tutan yepyeni bir dijital organ gibidir."
);
en.chapters['workspace-model'].draft.sections[0].paragraphs.push(
  "Current workspaces consist of static folders and pages. Information sits there waiting for you to find it.",
  "Saule's workspace model is dynamic. It evolves with you as you work. It helps you close open loops, notices bottlenecks, and protects your attention.",
  "This is like a brand new digital organ that keeps not just the data, but the process and the 'state of work' in memory."
);

fs.writeFileSync(trPath, JSON.stringify(tr, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Content enriched successfully.');
