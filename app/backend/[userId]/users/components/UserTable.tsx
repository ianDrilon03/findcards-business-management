'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User } from '@/lib/types/user'
import { avatarName } from '@/helpers/avatarName'
import { updateRole } from '@/supabase/db/authClient'
import { useRouter } from 'next/navigation'
import { useCreateUserDialog } from '@/service/create-user-dialog'

type UserData = Omit<User, 'password'>

interface UserTableData {
  user: UserData[]
}

export function UsersTable({ user: data }: UserTableData) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const toggleOpenDialog = useCreateUserDialog(
    (state) => state.toggleOpenDialog
  )

  const router = useRouter()

  const columns: ColumnDef<UserData>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: function ({ row }) {
          return (
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage
                  className='object-cover'
                  src={row.original?.avatar}
                  alt={row.original?.email}
                />
                <AvatarFallback className='rounded-lg fill-blue-500 bg-blue-400 text-white font-semibold capitalize'>
                  {avatarName(row.original?.email)}
                </AvatarFallback>
              </Avatar>
              <div className='capitalize font-semibold'>
                {row.getValue('name')}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: function ({ row }) {
          const isAdmin = row.original.role === 'admin'

          return (
            <div className='flex items-center space-x-2'>
              <Switch
                id='airplane-mode'
                checked={isAdmin}
                onCheckedChange={async (e) => {
                  await updateRole(
                    e ? 'admin' : 'user',
                    row?.original?.id as string
                  )

                  router.refresh()
                }}
              />
              <Label htmlFor='airplane-mode'>{row.getValue('role')}</Label>
            </div>
          )
        }
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className='lowercase'>{row.getValue('email')}</div>
        )
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ row }) => (
          <div className='lowercase'>{row.getValue('address')}</div>
        )
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className='lowercase'>{row.getValue('phone')}</div>
        )
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => (
          <div className='lowercase'>{row.getValue('gender')}</div>
        )
      }
      // {
      //   id: 'actions',
      //   header: 'Actions',
      //   enableHiding: false,
      //   cell: () => (
      //     <DropdownMenu>
      //       <DropdownMenuTrigger asChild>
      //         <Button variant='ghost' className='h-8 w-8 p-0'>
      //           <span className='sr-only'>Open menu</span>
      //           <MoreHorizontal />
      //         </Button>
      //       </DropdownMenuTrigger>
      //       <DropdownMenuContent align='end'>
      //         <DropdownMenuItem>
      //           <Shield />
      //           Make admin
      //         </DropdownMenuItem>
      //       </DropdownMenuContent>
      //     </DropdownMenu>
      //   )
      // }
    ],
    [router]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Search users...'
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map(function (column) {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type='button' onClick={() => toggleOpenDialog?.(true)}>
            Register
          </Button>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(function (header) {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
