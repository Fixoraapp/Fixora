import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CurrencySwitcher } from '../CurrencySwitcher';
import { FixoraLogo } from '../FixoraLogo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { defaultGlavBlogPages, GlavBlogBlock, GlavBlogPage } from '../../context/AdminConfigContext';
import { activeGlavBlogPages, localized } from '../../utils/glavBlog';

type Props = {
  pages: GlavBlogPage[];
  activePageId: GlavBlogPage['id'];
  language: string;
  onSelectPage: (id: GlavBlogPage['id']) => void;
  onLogin: () => void;
  onRegister: () => void;
};

const splitItem = (item: string) => item.split('|').map((part) => part.trim());
const fallbackPage = (id: GlavBlogPage['id']) => defaultGlavBlogPages.find((page) => page.id === id) ?? defaultGlavBlogPages[0];
const normalizePage = (page: GlavBlogPage | undefined, id?: GlavBlogPage['id']): GlavBlogPage => {
  const fallback = fallbackPage(id ?? page?.id ?? 'home');
  if (!page) {
    return fallback;
  }
  const mergedBlocks = page.blocks?.length ? page.blocks : fallback.blocks;
  return { ...fallback, ...page, blocks: mergedBlocks };
};
const blocksFor = (page: GlavBlogPage) => {
  const fallback = fallbackPage(page.id);
  const sourceBlocks = page.blocks?.length ? page.blocks : fallback.blocks;
  const visibleBlocks = [...sourceBlocks].filter((block) => block.isActive && block.status !== 'draft').sort((a, b) => a.sortOrder - b.sortOrder);
  return visibleBlocks.length ? visibleBlocks : fallback.blocks;
};
const blockOf = (page: GlavBlogPage, type: GlavBlogBlock['type']) => blocksFor(page).find((block) => block.type === type) ?? fallbackPage(page.id).blocks.find((block) => block.type === type);
const blocksOf = (page: GlavBlogPage, type: GlavBlogBlock['type']) => {
  const blocks = blocksFor(page).filter((block) => block.type === type);
  return blocks.length ? blocks : fallbackPage(page.id).blocks.filter((block) => block.type === type);
};

export function GlavBlogWebsite({ pages, activePageId, language, onSelectPage, onLogin, onRegister }: Props) {
  const activePages = activeGlavBlogPages(pages);
  const menuPages = (activePages.length ? activePages : defaultGlavBlogPages).map((page) => normalizePage(page));
  const page = normalizePage(menuPages.find((item) => item.id === activePageId) ?? menuPages[0], activePageId);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <FixoraLogo size={50} wordmark />
        <View style={styles.nav}>
          {menuPages.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => onSelectPage(item.id)} style={[styles.navItem, page?.id === item.id && styles.navItemActive]}>
              <Text style={[styles.navText, page?.id === item.id && styles.navTextActive]}>{localized(item.menuTitle, language)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.actions}>
          <LanguageSwitcher compact />
          <CurrencySwitcher compact />
          <Pressable accessibilityRole="button" onPress={onLogin} style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onRegister} style={styles.registerButton}>
            <Text style={styles.registerText}>Registration</Text>
          </Pressable>
        </View>
      </View>
      {page ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Breadcrumb home={menuPages[0]} page={page} language={language} />
          {page.id === 'about' ? <AboutLayout page={page} language={language} /> : null}
          {page.id === 'company' ? <CompanyLayout page={page} language={language} /> : null}
          {page.id === 'features' ? <FeaturesLayout page={page} language={language} /> : null}
          {page.id === 'contact' ? <ContactLayout page={page} language={language} /> : null}
          {page.id === 'home' ? <HomeLayout page={page} language={language} onLogin={onLogin} onRegister={onRegister} /> : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Breadcrumb({ home, page, language }: { home?: GlavBlogPage; page: GlavBlogPage; language: string }) {
  return (
    <View style={styles.breadcrumb}>
      <Text style={styles.breadcrumbText}>{home ? localized(home.menuTitle, language) : 'Home'}</Text>
      <Text style={styles.breadcrumbArrow}>{'>'}</Text>
      <Text style={styles.breadcrumbText}>{localized(page.menuTitle, language)}</Text>
    </View>
  );
}

function AboutLayout({ page, language }: { page: GlavBlogPage; language: string }) {
  const hero = blockOf(page, 'hero');
  const benefits = blockOf(page, 'benefits');
  const mission = blockOf(page, 'text');
  const why = blocksOf(page, 'benefits')[1];
  const cta = blockOf(page, 'cta');
  return (
    <View>
      {hero ? <HeroWithImage page={page} block={hero} language={language} imageKind="people" /> : null}
      {benefits ? <BenefitStrip block={benefits} language={language} /> : null}
      <View style={styles.twoColumnSection}>
        {mission ? <MissionCard block={mission} language={language} /> : null}
        <TargetIllustration />
        {why ? <ChecklistCard block={why} language={language} /> : null}
      </View>
      {cta ? <WideCta block={cta} language={language} /> : null}
    </View>
  );
}

function CompanyLayout({ page, language }: { page: GlavBlogPage; language: string }) {
  const hero = blockOf(page, 'hero');
  const timeline = blockOf(page, 'timeline');
  const values = blockOf(page, 'benefits');
  const mission = blockOf(page, 'text');
  const team = blockOf(page, 'team');
  return (
    <View>
      {hero ? <HeroWithImage page={page} block={hero} language={language} imageKind="building" /> : null}
      <View style={styles.companyGrid}>
        {timeline ? <TimelineCard block={timeline} language={language} /> : null}
        {values ? <ValuesCard block={values} language={language} /> : null}
      </View>
      <View style={styles.companyBottom}>
        {mission ? <MissionCard block={mission} language={language} /> : null}
        <TargetIllustration />
        {team ? <TeamCard block={team} language={language} /> : null}
      </View>
    </View>
  );
}

function FeaturesLayout({ page, language }: { page: GlavBlogPage; language: string }) {
  const hero = blockOf(page, 'hero');
  const features = blockOf(page, 'features');
  const stats = blockOf(page, 'statistics') ?? blockOf(page, 'stats');
  return (
    <View>
      {hero ? <FeatureHero page={page} block={hero} language={language} /> : null}
      {features ? <FeatureMatrix block={features} language={language} /> : null}
      {stats ? <StatsStrip block={stats} /> : null}
    </View>
  );
}

function ContactLayout({ page, language }: { page: GlavBlogPage; language: string }) {
  const hero = blockOf(page, 'hero');
  const offices = blockOf(page, 'offices');
  const form = blockOf(page, 'contact');
  const map = blockOf(page, 'map');
  const cta = blockOf(page, 'cta');
  return (
    <View>
      <View style={styles.contactTop}>
        <View style={styles.contactCopy}>
          {hero ? <SectionHeading block={hero} language={language} /> : null}
          {offices ? <ContactCards block={offices} language={language} /> : null}
        </View>
        {form ? <ContactForm block={form} language={language} /> : null}
      </View>
      {map ? <MapCoverage block={map} language={language} /> : null}
      {cta ? <EmergencyCta block={cta} language={language} /> : null}
    </View>
  );
}

function HomeLayout({ page, language, onLogin, onRegister }: { page: GlavBlogPage; language: string; onLogin: () => void; onRegister: () => void }) {
  const hero = blockOf(page, 'hero') ?? fallbackPage('home').blocks[0];
  const download = blockOf(page, 'download');
  return (
    <View>
      <View style={styles.homeHero}>
        <View style={styles.homeCopy}>
          <Text style={styles.homeBadge}>Premium access Fixora</Text>
          <Text style={styles.homeTitle}>{localized(hero.title, language)}</Text>
          <Text style={styles.homeSubtitle}>{localized(hero.body, language)}</Text>
          <View style={styles.homeActions}>
            <Pressable accessibilityRole="button" onPress={onRegister} style={styles.homePrimaryButton}>
              <Text style={styles.homePrimaryText}>{localized(page.buttonText, language) || 'Create account'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onLogin} style={styles.homeSecondaryButton}>
              <Text style={styles.homeSecondaryText}>Login</Text>
            </Pressable>
          </View>
          <View style={styles.storeButtons}>
            <StoreButton small="GET IT ON" title="Google Play" />
            <StoreButton small="Download on the" title="App Store" />
          </View>
        </View>
        <PhonePair />
      </View>
      <StatsStrip block={hero} />
      {download ? <WideCta block={download} language={language} /> : null}
    </View>
  );
}

function StoreButton({ small, title }: { small: string; title: string }) {
  return (
    <View style={styles.storeButton}>
      <Text style={styles.storeIcon}>{title.includes('Google') ? '▶' : '●'}</Text>
      <View>
        <Text style={styles.storeSmall}>{small}</Text>
        <Text style={styles.storeTitle}>{title}</Text>
      </View>
    </View>
  );
}

function SectionHeading({ block, language }: { block: GlavBlogBlock; language: string }) {
  const words = localized(block.title, language).split(' ');
  return (
    <View>
      <Text style={styles.eyebrow}>{localized(block.title, language).slice(0, 28)}</Text>
      <Text style={styles.pageTitle}>{words.slice(0, -2).join(' ')} <Text style={styles.accent}>{words.slice(-2).join(' ')}</Text></Text>
      <Text style={styles.pageDescription}>{localized(block.body, language)}</Text>
    </View>
  );
}

function HeroWithImage({ page, block, language, imageKind }: { page: GlavBlogPage; block: GlavBlogBlock; language: string; imageKind: 'people' | 'building' }) {
  return (
    <View style={styles.heroRow}>
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>{localized(page.subtitle, language)}</Text>
        <Text style={styles.pageTitle}>{localized(block.title, language)}</Text>
        <Text style={styles.pageDescription}>{localized(block.body, language)}</Text>
        <StatsCards items={block.items} />
      </View>
      <View style={styles.heroMedia}>
        {block.imageUrl ? <Image source={{ uri: block.imageUrl }} style={styles.heroImage} /> : <HeroFallback kind={imageKind} />}
        <View style={styles.mediaBadge}>
          <Text style={styles.mediaBadgeIcon}>{imageKind === 'building' ? 'BLD' : 'OK'}</Text>
          <View>
            <Text style={styles.mediaBadgeTitle}>{splitItem(block.items[0] ?? 'Fixora|Platform')[1] ?? 'Fixora'}</Text>
            <Text style={styles.mediaBadgeText}>{imageKind === 'building' ? 'Работаем по всему миру' : '100% надежность'}</Text>
          </View>
        </View>
        <View style={styles.playBadge}><Text style={styles.playText}>▶</Text></View>
      </View>
    </View>
  );
}

function FeatureHero({ page, block, language }: { page: GlavBlogPage; block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.heroRow}>
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>{localized(page.subtitle, language)}</Text>
        <Text style={styles.pageTitle}>{localized(block.title, language)}</Text>
        <Text style={styles.pageDescription}>{localized(block.body, language)}</Text>
        <MiniFeatureCards items={block.items} />
      </View>
      <PhonePair />
    </View>
  );
}

function StatsCards({ items }: { items: string[] }) {
  return (
    <View style={styles.statsCards}>
      {items.map((item) => {
        const [value, label, icon] = splitItem(item);
        return (
          <View key={item} style={styles.statCard}>
            <View style={styles.statIcon}><Text style={styles.statIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function BenefitStrip({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.benefitStrip}>
      {block.items.map((item) => {
        const [title, text, icon] = splitItem(item);
        return (
          <View key={item} style={styles.benefitItem}>
            <View style={styles.largeIcon}><Text style={styles.largeIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.benefitTitle}>{title}</Text>
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function MissionCard({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.missionCard}>
      <Text style={styles.pill}>{localized(block.title, language).split(' ').slice(0, 2).join(' ')}</Text>
      <Text style={styles.sectionTitle}>{localized(block.title, language)}</Text>
      <Text style={styles.sectionText}>{localized(block.body, language)}</Text>
    </View>
  );
}

function ChecklistCard({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.checklist}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      {block.items.map((item) => {
        const [title, text] = splitItem(item);
        return (
          <View key={item} style={styles.checkRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <View>
              <Text style={styles.checkTitle}>{title}</Text>
              <Text style={styles.checkText}>{text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TimelineCard({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.timelineCard}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      <View style={styles.timelineLine} />
      <View style={styles.timelineItems}>
        {block.items.map((item) => {
          const [year, title, text] = splitItem(item);
          return (
            <View key={item} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>{year}</Text>
              <Text style={styles.timelineTitle}>{title}</Text>
              <Text style={styles.timelineText}>{text}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ValuesCard({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.valuesCard}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      {block.items.map((item) => {
        const [title, text, icon] = splitItem(item);
        return (
          <View key={item} style={styles.valueRow}>
            <View style={styles.smallIcon}><Text style={styles.smallIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.valueTitle}>{title}</Text>
              <Text style={styles.valueText}>{text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TeamCard({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.teamCard}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      <Text style={styles.sectionText}>{localized(block.body, language)}</Text>
      <View style={styles.teamGrid}>
        {block.items.map((item) => {
          const [name, role, image] = splitItem(item);
          return (
            <View key={item} style={styles.memberCard}>
              {image ? <Image source={{ uri: image }} style={styles.memberImage} /> : <View style={styles.memberImage} />}
              <Text style={styles.memberName}>{name}</Text>
              <Text style={styles.memberRole}>{role}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FeatureMatrix({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.featureMatrix}>
      {block.items.map((item) => {
        const [title, text, icon] = splitItem(item);
        return (
          <View key={item} style={styles.featureCell}>
            <View style={styles.largeIcon}><Text style={styles.largeIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StatsStrip({ block }: { block: GlavBlogBlock }) {
  return (
    <View style={styles.statsStrip}>
      {block.items.map((item) => {
        const [value, label, icon] = splitItem(item);
        return (
          <View key={item} style={styles.statsStripItem}>
            <View style={styles.statIcon}><Text style={styles.statIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.bigStat}>{value}</Text>
              <Text style={styles.bigStatLabel}>{label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ContactCards({ block }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.contactCards}>
      {block.items.map((item) => {
        const [title, line1, line2, icon] = splitItem(item);
        return (
          <View key={item} style={styles.contactCard}>
            <View style={styles.largeIcon}><Text style={styles.largeIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.contactTitle}>{title}</Text>
              <Text style={styles.contactLine}>{line1}</Text>
              <Text style={styles.contactLine}>{line2}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ContactForm({ block, language }: { block: GlavBlogBlock; language: string }) {
  const labels = block.items;
  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      <Text style={styles.sectionText}>{localized(block.body, language)}</Text>
      <View style={styles.formRow}>
        <TextInput placeholder={labels[0]} placeholderTextColor="#7A849D" style={styles.formInput} />
        <TextInput placeholder={labels[1]} placeholderTextColor="#7A849D" style={styles.formInput} />
      </View>
      <TextInput placeholder={labels[2]} placeholderTextColor="#7A849D" style={styles.formInput} />
      <TextInput placeholder={labels[3]} placeholderTextColor="#7A849D" style={styles.formInput} />
      <TextInput placeholder={labels[4]} placeholderTextColor="#7A849D" multiline style={styles.formArea} />
      <Pressable accessibilityRole="button" style={styles.formButton}><Text style={styles.formButtonText}>{labels[5]}</Text></Pressable>
    </View>
  );
}

function MapCoverage({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.mapPanel}>
      <View style={styles.fakeMap}><Text style={styles.mapPin}>●</Text></View>
      <View style={styles.coverageCopy}>
        <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
        <Text style={styles.sectionText}>{localized(block.body, language)}</Text>
        <View style={styles.cityPills}>
          {block.items.map((item) => <Text key={item} style={styles.cityPill}>{item}</Text>)}
        </View>
      </View>
      <View style={styles.armeniaMap}>
        {[0, 1, 2, 3, 4].map((dot) => <View key={dot} style={[styles.mapDot, { left: 30 + dot * 28, top: 20 + (dot % 3) * 36 }]} />)}
      </View>
    </View>
  );
}

function EmergencyCta({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <LinearGradient colors={['#7A3FF3', '#4A55F6']} style={styles.emergency}>
      <View style={styles.emergencyIcon}><Text style={styles.emergencyIconText}>☎</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.emergencyTitle}>{localized(block.title, language)}</Text>
        <Text style={styles.emergencyText}>{localized(block.body, language)}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.emergencyButton}><Text style={styles.emergencyButtonText}>{block.items[0]}</Text></Pressable>
    </LinearGradient>
  );
}

function MiniFeatureCards({ items }: { items: string[] }) {
  return (
    <View style={styles.miniCards}>
      {items.map((item) => {
        const [title, text, icon] = splitItem(item);
        return (
          <View key={item} style={styles.miniCard}>
            <View style={styles.smallIcon}><Text style={styles.smallIconText}>{iconLabel(icon)}</Text></View>
            <View>
              <Text style={styles.miniTitle}>{title}</Text>
              <Text style={styles.miniText}>{text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function WideCta({ block, language }: { block: GlavBlogBlock; language: string }) {
  return (
    <View style={styles.wideCta}>
      <Text style={styles.sectionTitleSmall}>{localized(block.title, language)}</Text>
      <Text style={styles.sectionText}>{localized(block.body, language)}</Text>
      <Pressable accessibilityRole="button" style={styles.outlineButton}><Text style={styles.outlineButtonText}>{block.items[0] ?? localized(block.title, language)}</Text></Pressable>
    </View>
  );
}

function TargetIllustration() {
  return (
    <LinearGradient colors={['#F4F0FF', '#EEF6FF']} style={styles.targetCard}>
      <View style={styles.targetOuter}><View style={styles.targetMiddle}><View style={styles.targetInner} /></View></View>
      <View style={styles.targetBarOne} />
      <View style={styles.targetBarTwo} />
    </LinearGradient>
  );
}

function HeroFallback({ kind }: { kind: 'people' | 'building' }) {
  return (
    <LinearGradient colors={kind === 'building' ? ['#0F2F5F', '#163C73'] : ['#DDEAFF', '#F6F1FF']} style={styles.heroImage}>
      <Text style={styles.fallbackLogo}>Fixora</Text>
    </LinearGradient>
  );
}

function PhonePair() {
  return (
    <View style={styles.phonePair}>
      <View style={[styles.phoneMock, styles.phoneOne]}>
        <View style={styles.notch} />
        <Text style={styles.phoneBrand}>Fixora</Text>
        <View style={styles.phoneInput} />
        <LinearGradient colors={['#7A3FF3', '#2F80ED']} style={styles.phoneBanner}><Text style={styles.phoneBannerText}>Создать заказ</Text></LinearGradient>
        <View style={styles.phonePanel} />
        <View style={styles.phoneButton} />
      </View>
      <View style={[styles.phoneMock, styles.phoneTwo]}>
        <View style={styles.notch} />
        <Text style={styles.phoneBrand}>Fixora</Text>
        <View style={styles.phoneInput} />
        <View style={styles.messageCard}><Text style={styles.messageText}>SMS / Push</Text></View>
        <View style={styles.messageCard}><Text style={styles.messageText}>Новый заказ</Text></View>
      </View>
    </View>
  );
}

function iconLabel(icon?: string) {
  const map: Record<string, string> = { users: '●', smile: '☺', check: '✓', shield: '◇', star: '☆', bolt: 'ϟ', headphones: '☎', rocket: '↗', chat: '□', card: '▭', bell: '○', heart: '♡', search: '⌕', briefcase: '▣', trophy: '♕', pin: '⌖', phone: '☎', mail: '✉', clock: '◷', info: 'i' };
  return map[icon ?? ''] ?? '●';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { minHeight: 82, paddingHorizontal: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E4EAF5' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30, flexWrap: 'wrap', justifyContent: 'center', flex: 1 },
  navItem: { minHeight: 52, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  navItemActive: { borderBottomColor: '#7A3FF3' },
  navText: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  navTextActive: { color: '#7A3FF3' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  loginButton: { minHeight: 46, paddingHorizontal: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#7A3FF3' },
  loginText: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  registerButton: { minHeight: 46, paddingHorizontal: 24, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6E45E8' },
  registerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  content: { paddingHorizontal: 126, paddingTop: 34, paddingBottom: 44 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 34 },
  breadcrumbText: { color: '#7B8498', fontSize: 12, fontWeight: '900' },
  breadcrumbArrow: { color: '#A0A9BC', fontSize: 12, fontWeight: '900' },
  homeHero: { minHeight: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 70 },
  homeCopy: { flex: 1, maxWidth: 650 },
  homeBadge: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, overflow: 'hidden', color: '#5B46E8', backgroundColor: '#EEE9FF', fontSize: 14, fontWeight: '900' },
  homeTitle: { marginTop: 28, color: '#07153C', fontSize: 58, lineHeight: 70, fontWeight: '900' },
  homeSubtitle: { marginTop: 22, maxWidth: 540, color: '#5B6680', fontSize: 20, lineHeight: 32, fontWeight: '700' },
  homeActions: { marginTop: 34, flexDirection: 'row', alignItems: 'center', gap: 18 },
  homePrimaryButton: { minHeight: 58, paddingHorizontal: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8', shadowColor: '#6F45E8', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  homePrimaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  homeSecondaryButton: { minHeight: 58, paddingHorizontal: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#7857EF' },
  homeSecondaryText: { color: '#6F45E8', fontSize: 17, fontWeight: '900' },
  storeButtons: { marginTop: 30, flexDirection: 'row', gap: 20 },
  storeButton: { minWidth: 178, minHeight: 58, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#050505' },
  storeIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  storeSmall: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  storeTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  heroRow: { minHeight: 390, flexDirection: 'row', alignItems: 'center', gap: 70 },
  heroCopy: { flex: 1 },
  eyebrow: { color: '#8B6BFF', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  pageTitle: { marginTop: 18, color: '#07153C', fontSize: 44, lineHeight: 55, fontWeight: '900' },
  accent: { color: '#7A3FF3' },
  pageDescription: { marginTop: 18, maxWidth: 600, color: '#5B6680', fontSize: 17, lineHeight: 29, fontWeight: '700' },
  statsCards: { marginTop: 30, flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  statCard: { width: 176, minHeight: 76, paddingHorizontal: 16, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EEF7', shadowColor: '#6D7BA8', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  statIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF' },
  statIconText: { color: '#784CF5', fontSize: 22, fontWeight: '900' },
  statValue: { color: '#07153C', fontSize: 22, fontWeight: '900' },
  statLabel: { marginTop: 3, color: '#5E6982', fontSize: 11, fontWeight: '800' },
  heroMedia: { flex: 1, minHeight: 340, borderRadius: 14, overflow: 'hidden' },
  heroImage: { width: '100%', height: 340, borderRadius: 14 },
  fallbackLogo: { marginTop: 120, color: '#FFFFFF', fontSize: 44, fontWeight: '900', textAlign: 'center' },
  mediaBadge: { position: 'absolute', left: 18, bottom: 18, minWidth: 260, minHeight: 64, paddingHorizontal: 18, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#6E45E8' },
  mediaBadgeIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  mediaBadgeTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  mediaBadgeText: { marginTop: 4, color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  playBadge: { position: 'absolute', right: 112, bottom: 36, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  playText: { color: '#784CF5', fontSize: 20, fontWeight: '900' },
  benefitStrip: { marginTop: 28, minHeight: 118, padding: 24, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  benefitItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 20, borderRightWidth: 1, borderRightColor: '#E3E9F4' },
  largeIcon: { width: 58, height: 58, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF' },
  largeIconText: { color: '#784CF5', fontSize: 28, fontWeight: '900' },
  benefitTitle: { color: '#07153C', fontSize: 16, fontWeight: '900' },
  benefitText: { marginTop: 8, maxWidth: 220, color: '#5E6982', fontSize: 13, lineHeight: 20, fontWeight: '700' },
  twoColumnSection: { marginTop: 42, flexDirection: 'row', alignItems: 'center', gap: 48 },
  missionCard: { flex: 1, minWidth: 280 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, overflow: 'hidden', color: '#7A3FF3', backgroundColor: '#EFEAFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  sectionTitle: { marginTop: 18, color: '#07153C', fontSize: 29, lineHeight: 36, fontWeight: '900' },
  sectionTitleSmall: { color: '#07153C', fontSize: 18, fontWeight: '900' },
  sectionText: { marginTop: 12, color: '#5B6680', fontSize: 14, lineHeight: 23, fontWeight: '700' },
  targetCard: { width: 250, height: 250, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E9F5' },
  targetOuter: { width: 124, height: 124, borderRadius: 62, alignItems: 'center', justifyContent: 'center', borderWidth: 12, borderColor: '#8B5CF6' },
  targetMiddle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 10, borderColor: '#A78BFA' },
  targetInner: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#6E45E8' },
  targetBarOne: { position: 'absolute', right: 38, bottom: 28, width: 36, height: 84, borderRadius: 8, backgroundColor: '#B8A4FF' },
  targetBarTwo: { position: 'absolute', right: 86, bottom: 28, width: 34, height: 56, borderRadius: 8, backgroundColor: '#C9BBFF' },
  checklist: { flex: 1.1, gap: 10 },
  checkRow: { minHeight: 56, paddingHorizontal: 18, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  checkIcon: { width: 26, height: 26, borderRadius: 13, overflow: 'hidden', color: '#FFFFFF', backgroundColor: '#6E45E8', textAlign: 'center', lineHeight: 26, fontWeight: '900' },
  checkTitle: { color: '#07153C', fontSize: 13, fontWeight: '900' },
  checkText: { marginTop: 3, color: '#5E6982', fontSize: 12, fontWeight: '700' },
  companyGrid: { marginTop: 26, flexDirection: 'row', gap: 18 },
  timelineCard: { flex: 1.65, minHeight: 220, padding: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  timelineLine: { marginTop: 62, height: 2, backgroundColor: '#DDE5F5' },
  timelineItems: { marginTop: -11, flexDirection: 'row', gap: 22 },
  timelineItem: { flex: 1 },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#6E45E8' },
  timelineYear: { marginTop: 16, color: '#07153C', fontSize: 14, fontWeight: '900' },
  timelineTitle: { marginTop: 8, color: '#07153C', fontSize: 12, fontWeight: '900' },
  timelineText: { marginTop: 6, color: '#5E6982', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  valuesCard: { flex: 0.85, minHeight: 220, padding: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7', gap: 14 },
  valueRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  smallIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF' },
  smallIconText: { color: '#784CF5', fontSize: 18, fontWeight: '900' },
  valueTitle: { color: '#07153C', fontSize: 13, fontWeight: '900' },
  valueText: { marginTop: 3, color: '#5E6982', fontSize: 12, fontWeight: '700' },
  companyBottom: { marginTop: 28, flexDirection: 'row', gap: 44, alignItems: 'center' },
  teamCard: { flex: 1.2 },
  teamGrid: { marginTop: 18, flexDirection: 'row', gap: 18 },
  memberCard: { width: 116, padding: 10, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  memberImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#E9EEF7' },
  memberName: { marginTop: 10, color: '#07153C', fontSize: 11, textAlign: 'center', fontWeight: '900' },
  memberRole: { marginTop: 4, color: '#5E6982', fontSize: 10, textAlign: 'center', fontWeight: '700' },
  miniCards: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap' },
  miniCard: { width: 190, minHeight: 104, padding: 16, flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  miniTitle: { color: '#07153C', fontSize: 13, fontWeight: '900' },
  miniText: { marginTop: 6, maxWidth: 120, color: '#5E6982', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  phonePair: { flex: 1, minHeight: 380 },
  phoneMock: { position: 'absolute', width: 190, height: 340, padding: 16, borderRadius: 34, backgroundColor: '#FFFFFF', borderWidth: 7, borderColor: '#111827', shadowColor: '#7A3FF3', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 18 } },
  phoneOne: { left: 40, top: 10, transform: [{ rotate: '-6deg' }] },
  phoneTwo: { right: 24, top: 36, transform: [{ rotate: '7deg' }] },
  notch: { alignSelf: 'center', width: 78, height: 16, borderRadius: 10, backgroundColor: '#111827', marginTop: -10 },
  phoneBrand: { marginTop: 16, color: '#07153C', fontSize: 13, fontWeight: '900' },
  phoneInput: { marginTop: 14, height: 32, borderRadius: 11, backgroundColor: '#F2F5FB' },
  phoneBanner: { marginTop: 12, height: 70, borderRadius: 14, padding: 12 },
  phoneBannerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  phonePanel: { marginTop: 14, height: 86, borderRadius: 14, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#E2E8F2' },
  phoneButton: { marginTop: 12, height: 34, borderRadius: 11, backgroundColor: '#6E45E8' },
  messageCard: { marginTop: 16, minHeight: 54, padding: 12, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F2' },
  messageText: { color: '#2F80ED', fontSize: 11, fontWeight: '900' },
  featureMatrix: { marginTop: 36, padding: 24, borderRadius: 16, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  featureCell: { width: '25%', minHeight: 118, padding: 18, flexDirection: 'row', gap: 18, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E7EDF7' },
  featureTitle: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  featureText: { marginTop: 8, color: '#5E6982', fontSize: 12, lineHeight: 19, fontWeight: '700' },
  statsStrip: { marginTop: 42, minHeight: 132, paddingHorizontal: 38, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  statsStripItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 22, borderRightWidth: 1, borderRightColor: '#E1E7F2', paddingHorizontal: 22 },
  bigStat: { color: '#07153C', fontSize: 30, fontWeight: '900' },
  bigStatLabel: { marginTop: 5, color: '#5E6982', fontSize: 15, fontWeight: '800' },
  contactTop: { flexDirection: 'row', alignItems: 'center', gap: 72 },
  contactCopy: { flex: 1 },
  contactCards: { marginTop: 30, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  contactCard: { width: 260, minHeight: 96, padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  contactTitle: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  contactLine: { marginTop: 5, color: '#5E6982', fontSize: 12, fontWeight: '700' },
  formCard: { flex: 1, minHeight: 430, padding: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7', shadowColor: '#6D7BA8', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  formRow: { flexDirection: 'row', gap: 14 },
  formInput: { flex: 1, minHeight: 48, marginTop: 16, paddingHorizontal: 16, borderRadius: 8, color: '#07153C', borderWidth: 1, borderColor: '#CFD8EA', fontSize: 13, fontWeight: '800' },
  formArea: { minHeight: 112, marginTop: 16, paddingHorizontal: 16, paddingTop: 14, borderRadius: 8, color: '#07153C', borderWidth: 1, borderColor: '#CFD8EA', fontSize: 13, fontWeight: '800' },
  formButton: { marginTop: 16, minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6E45E8' },
  formButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  mapPanel: { marginTop: 34, minHeight: 220, borderRadius: 14, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  fakeMap: { flex: 1.1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF4FF' },
  mapPin: { color: '#6E45E8', fontSize: 42, fontWeight: '900' },
  coverageCopy: { flex: 1.25, padding: 32, justifyContent: 'center' },
  cityPills: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cityPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, overflow: 'hidden', color: '#6E45E8', backgroundColor: '#F6F3FF', fontSize: 11, fontWeight: '900' },
  armeniaMap: { width: 300, backgroundColor: '#F5F0FF' },
  mapDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#6E45E8' },
  emergency: { marginTop: 24, minHeight: 78, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 18 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  emergencyIconText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  emergencyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  emergencyText: { marginTop: 5, color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  emergencyButton: { minHeight: 44, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF' },
  emergencyButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  wideCta: { marginTop: 32, padding: 26, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EDF7' },
  outlineButton: { marginTop: 18, alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#6E45E8' },
  outlineButtonText: { color: '#6E45E8', fontSize: 13, fontWeight: '900' },
});
