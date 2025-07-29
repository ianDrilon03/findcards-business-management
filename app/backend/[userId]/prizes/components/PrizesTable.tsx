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
import {
  ChevronDown,
  PlusIcon,
  Pencil,
  Trash,
  EllipsisVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
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
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DialogAlert } from '@/components/custom/DialogAlert'
import { Button } from '@/components/ui/button'
import { useCreatePrizesDialog } from '@/service/create-prizes-dialog'
import { useShallow } from 'zustand/react/shallow'
import { PrizesTable } from '@/lib/types/prizes'
import { archivedPrize } from '@/supabase/db/prizes'

interface PrizesTableType {
  prizes: PrizesTable[]
}

export function PrizeTable({ prizes: data }: PrizesTableType) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isPending, startTransition] = React.useTransition()
  const {
    data: prizeData,
    open,
    toggleOpenDialog
  } = useCreatePrizesDialog(
    useShallow((state) => ({
      data: state.data,
      open: state.open,
      toggleOpenDialog: state.toggleOpenDialog
    }))
  )

  const onArchivePrize = async (): Promise<void> => {
    startTransition(async () => {
      await archivedPrize(prizeData?.id as string)
    })
  }

  const columns: ColumnDef<PrizesTable>[] = React.useMemo(
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
                  src={row.original?.image as string}
                  alt={row.original?.name}
                />
              </Avatar>
              <div className='capitalize font-semibold'>
                {row.getValue('name')}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'claimed_by',
        header: 'Claimed By',
        cell: function ({ row }) {
          return <div>{row.original.claimed_by?.email ?? 'N/A'}</div>
        }
      },
      {
        accessorKey: 'credit_cost',
        header: 'Credit Cost',
        cell: ({ row }) => (
          <Badge className='lowercase'>{row.getValue('credit_cost')}</Badge>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className='lowercase' variant='secondary'>
            {row.getValue('status')}
          </Badge>
        )
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <div>
            {format(row.getValue('created_at'), "MMMM dd, yyyy hh:mm aaaaa'm'")}
          </div>
        )
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: ({ row }) => (
          <div>
            {!!row.getValue('updated_at')
              ? format(
                  row.getValue('updated_at'),
                  "MMMM dd, yyyy hh:mm aaaaa'm'"
                )
              : 'N/A'}
          </div>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0 cursor-pointer'>
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpenDialog?.(true, {
                    id: row.original.id,
                    name: row.original.name,
                    status: row.original.status,
                    creditCost: Number(row.original.credit_cost),
                    image: row.original.image as string
                  })
                }
              >
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpenDialog?.(true, {
                    id: row.original.id,
                    name: null,
                    status: null,
                    image: null,
                    creditCost: 0
                  })
                }
              >
                <Trash />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [toggleOpenDialog]
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
          placeholder='Search prizes name...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
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
          <Button
            type='button'
            className='cursor-pointer'
            onClick={() => toggleOpenDialog?.(true, null)}
          >
            <PlusIcon />
            Add Prizes
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
      <DialogAlert
        open={open && !prizeData?.name}
        title='Remove Prizes'
        description='Do you want to remove this prizes?'
        callback={onArchivePrize}
        cancel={() => toggleOpenDialog?.(false, null)}
        isLoading={isPending}
        type='error'
      />
    </div>
  )
}
