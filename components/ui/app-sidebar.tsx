'use client'

import * as React from 'react'
import {
  // AudioWaveform,
  // Command,
  // IdCard,
  Briefcase,
  Users,
  VectorSquare
  // FileText,
  // LayoutDashboard
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
import { appName } from '@/helpers/constants'
// import { User } from '@supabase/supabase-js'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useUser()

  // This is sample data.
  const data = {
    user: {
      email: userData?.user?.email as string,
      avatar: ''
    },
    teams: appName(userData?.user?.email as string),
    navMain: [
      // {
      //   title: 'Dashboard',
      //   url: `/backend/${userData?.user?.id}/dashboard`,
      //   icon: LayoutDashboard,
      //   isActive: true
      // },
      {
        title: 'Businesses',
        url: `/backend/${userData?.user?.id}/businesses`,
        icon: Briefcase,
        isActive: true
      },
      {
        title: 'Users',
        url: `/backend/${userData?.user?.id}/users`,
        icon: Users,
        isActive: true
      },
      {
        title: 'Category',
        url: `/backend/${userData?.user?.id}/category`,
        icon: VectorSquare,
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

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
