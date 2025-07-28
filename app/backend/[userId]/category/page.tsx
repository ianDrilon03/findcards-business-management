import { JSX } from 'react'
import { createClient } from '@/config'
import { AddCategoryDialog } from './components/AddCategoryDialog'
import { EditCategoryDialog } from './components/EditCategoryDialog'
import { CategoryTable } from './components/CategoryTable'
import { Container } from '@/components/custom/Container'

export default async function CategoryPage(): Promise<JSX.Element> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('category')
    .select('id, name, created_at, updated_at, archived_at')
    .is('archived_at', null)

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Manage Category'
      description='You can manage categories here'
    >
      <CategoryTable category={data} />
      <AddCategoryDialog />
      <EditCategoryDialog />
    </Container>
  )
}
