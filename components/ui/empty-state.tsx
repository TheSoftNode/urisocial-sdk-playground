import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Standardizes "nothing here yet" across the app — an icon, a plain-language
 * title, and a sentence saying what to do next. Modeled on the Blog and
 * Video pages, which already got this right; other pages fell back to a
 * bare spinner or an unlabeled "—", both of which read as broken rather
 * than empty.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-12">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
      </div>
    </Card>
  );
}
