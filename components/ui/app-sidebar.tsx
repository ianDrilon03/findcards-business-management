'use client'

import * as React from 'react'
import {
  AudioWaveform,
  Command,
  IdCard,
  Briefcase,
  // FileText,
  LayoutDashboard
  // UsersRound,
  // Activity
} from 'lucide-react'
import { NavMain } from '@/components/ui/nav-main'
import { NavUser } from '@/components/ui/nav-user'
import { TeamSwitcher } from '@/components/ui/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useUser } from '@/context/AuthProvider'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useUser()

  // This is sample data.
  const data = {
    user: {
      email: userData?.user?.email as string,
      avatar: ''
    },
    teams: [
      {
        name: 'FC Businesses Management',
        logo: IdCard,
        plan: userData?.user?.email as string
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup'
      },
      {
        name: 'Evil Corp.',
        logo: Command,
        plan: 'Free'
      }
    ],
    navMain: [
      {
        title: 'Dashboard',
        url: `/backend/${userData?.user?.id}/dashboard`,
        icon: LayoutDashboard,
        isActive: true
      },
      {
        title: 'Businesses',
        url: `/backend/${userData?.user?.id}/businesses`,
        icon: Briefcase,
        isActive: true
      }
      // {
      //   title: 'My Tickets',
      //   url: `/backend/${userData?.user?.id}/my-tickets`,
      //   icon: FileText,
      //   isActive: true
      // },
      // {
      //   title: 'Users',
      //   url: `/backend/${userData?.user?.id}/users`,
      //   icon: UsersRound,
      //   isActive: true
      // },
      // {
      //   title: 'Activity Log',
      //   url: `/backend/${userData?.user?.id}/activity-log?limit=5`,
      //   icon: Activity,
      //   isActive: true
      // }
    ]
  }

  const adminMenus =
    userData?.user?.userRole === 'admin'
      ? data.navMain
      : data.navMain.filter(
          (item) => !['Dashboard', 'Users', 'Activity Log'].includes(item.title)
        )

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminMenus} />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
