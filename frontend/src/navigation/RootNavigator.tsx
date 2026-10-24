import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentProps } from 'react';
import { useWindowDimensions } from 'react-native';

import { useAdminSession } from '../features/admin/AdminSessionContext';
import { AdminHomeScreen } from '../screens/AdminHomeScreen';
import { AdminCatFormScreen } from '../screens/AdminCatFormScreen';
import { AdminCatHealthScreen } from '../screens/AdminCatHealthScreen';
import { AdminCatPhotosScreen } from '../screens/AdminCatPhotosScreen';
import { AdminCatsScreen } from '../screens/AdminCatsScreen';
import { AdminCampaignFormScreen } from '../screens/AdminCampaignFormScreen';
import { AdminCampaignsScreen } from '../screens/AdminCampaignsScreen';
import { AdminArticleFormScreen } from '../screens/AdminArticleFormScreen';
import { AdminCategoryFormScreen } from '../screens/AdminCategoryFormScreen';
import { AdminGuideScreen } from '../screens/AdminGuideScreen';
import { AdminInfoFormScreen } from '../screens/AdminInfoFormScreen';
import { AdminInfoScreen } from '../screens/AdminInfoScreen';
import { AdminPartnerFormScreen } from '../screens/AdminPartnerFormScreen';
import { AdminPartnersScreen } from '../screens/AdminPartnersScreen';
import { AdminPublicationFormScreen } from '../screens/AdminPublicationFormScreen';
import { AdminPublicationsScreen } from '../screens/AdminPublicationsScreen';
import { AdminReceiptDetailsScreen } from '../screens/AdminReceiptDetailsScreen';
import { AdminReceiptsScreen } from '../screens/AdminReceiptsScreen';
import { AdminLoginScreen } from '../screens/AdminLoginScreen';
import { AdminPreviewScreen } from '../screens/AdminPreviewScreen';
import { AdoptionFormScreen } from '../screens/AdoptionFormScreen';
import { AdoptionSuccessScreen } from '../screens/AdoptionSuccessScreen';
import { CampaignDetailsScreen } from '../screens/CampaignDetailsScreen';
import { CampaignsScreen } from '../screens/CampaignsScreen';
import { CatDetailsScreen } from '../screens/CatDetailsScreen';
import { CatsScreen } from '../screens/CatsScreen';
import { GuideArticleScreen } from '../screens/GuideArticleScreen';
import { GuideScreen } from '../screens/GuideScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MedicationFormScreen } from '../screens/MedicationFormScreen';
import { MedicationSuccessScreen } from '../screens/MedicationSuccessScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { PartnersScreen } from '../screens/PartnersScreen';
import { PublicationDetailsScreen } from '../screens/PublicationDetailsScreen';
import { PublicationsScreen } from '../screens/PublicationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { fontFamilies, useColors } from '../theme';
import { AdminStackParamList, MainTabParamList, RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<keyof MainTabParamList, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Cats: { active: 'paw', inactive: 'paw-outline' },
  Campaigns: { active: 'megaphone', inactive: 'megaphone-outline' },
  Guide: { active: 'book', inactive: 'book-outline' },
  More: { active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-circle-outline' },
};

function MainTabs() {
  const colors = useColors();
  const { fontScale } = useWindowDimensions();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 6, ...(fontScale > 1.15 ? { paddingBottom: 16 } : {}) },
        tabBarLabelStyle: { fontSize: fontScale > 1.15 ? 9 : 11, fontFamily: fontFamilies.bold },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? tabIcons[route.name].active : tabIcons[route.name].inactive} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tabs.Screen name="Cats" component={CatsScreen} options={{ title: 'Gatos' }} />
      <Tabs.Screen name="Campaigns" component={CampaignsScreen} options={{ title: 'Campanhas', tabBarLabel: fontScale > 1.15 ? 'Camp.' : 'Campanhas', tabBarAccessibilityLabel: 'Campanhas' }} />
      <Tabs.Screen name="Guide" component={GuideScreen} options={{ title: 'Guia' }} />
      <Tabs.Screen name="More" component={MoreScreen} options={{ title: 'Mais' }} />
    </Tabs.Navigator>
  );
}

function AdminArea() {
  const { session } = useAdminSession();
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <AdminStack.Group>
          <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} />
          <AdminStack.Screen name="AdminCats" component={AdminCatsScreen} />
          <AdminStack.Screen name="AdminCatForm" component={AdminCatFormScreen} />
          <AdminStack.Screen name="AdminPreview" component={AdminPreviewScreen} />
          <AdminStack.Screen name="AdminCatPhotos" component={AdminCatPhotosScreen} />
          <AdminStack.Screen name="AdminCatHealth" component={AdminCatHealthScreen} />
          <AdminStack.Screen name="AdminReceipts" component={AdminReceiptsScreen} />
          <AdminStack.Screen name="AdminReceiptDetails" component={AdminReceiptDetailsScreen} />
          <AdminStack.Screen name="AdminCampaigns" component={AdminCampaignsScreen} />
          <AdminStack.Screen name="AdminCampaignForm" component={AdminCampaignFormScreen} />
          <AdminStack.Screen name="AdminGuide" component={AdminGuideScreen} />
          <AdminStack.Screen name="AdminArticleForm" component={AdminArticleFormScreen} />
          <AdminStack.Screen name="AdminCategoryForm" component={AdminCategoryFormScreen} />
          <AdminStack.Screen name="AdminPartners" component={AdminPartnersScreen} />
          <AdminStack.Screen name="AdminPartnerForm" component={AdminPartnerFormScreen} />
          <AdminStack.Screen name="AdminInfo" component={AdminInfoScreen} />
          <AdminStack.Screen name="AdminInfoForm" component={AdminInfoFormScreen} />
          <AdminStack.Screen name="AdminPublications" component={AdminPublicationsScreen} />
          <AdminStack.Screen name="AdminPublicationForm" component={AdminPublicationFormScreen} />
        </AdminStack.Group>
      ) : (
        <AdminStack.Screen name="AdminLogin" component={AdminLoginScreen} />
      )}
    </AdminStack.Navigator>
  );
}

export function RootNavigator() {
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { fontFamily: fontFamilies.extrabold }, headerShadowVisible: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CampaignDetails" component={CampaignDetailsScreen} options={{ title: 'Campanha' }} />
      <Stack.Screen name="CatDetails" component={CatDetailsScreen} options={{ title: 'Perfil do gato' }} />
      <Stack.Screen name="AdoptionForm" component={AdoptionFormScreen} options={{ title: 'Adoção' }} />
      <Stack.Screen name="AdoptionSuccess" component={AdoptionSuccessScreen} options={{ title: 'Confirmação', headerBackVisible: false }} />
      <Stack.Screen name="GuideArticle" component={GuideArticleScreen} options={{ title: 'Guia do Felino' }} />
      <Stack.Screen name="Partners" component={PartnersScreen} options={{ title: 'Parceiros' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'Medicamentos' }} />
      <Stack.Screen name="MedicationSuccess" component={MedicationSuccessScreen} options={{ title: 'Confirmação', headerBackVisible: false }} />
      <Stack.Screen name="Publications" component={PublicationsScreen} options={{ title: 'Publicações do Admin' }} />
      <Stack.Screen name="PublicationDetails" component={PublicationDetailsScreen} options={{ title: 'Publicação' }} />
      <Stack.Screen name="AdminArea" component={AdminArea} options={{ title: 'Área administrativa' }} />
    </Stack.Navigator>
  );
}
