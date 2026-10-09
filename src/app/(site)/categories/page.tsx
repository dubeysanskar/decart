import { redirect } from 'next/navigation';

/** The directory of every master category and category lives on /products. */
export default function CategoriesIndexPage() {
  redirect('/products');
}
