'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, CheckCircle2 } from 'lucide-react';

interface OutlineSection {
  heading: string;
  subheadings: string[];
}

interface BlogOutlineProps {
  outline: OutlineSection[];
  wordCount?: number;
}

export function BlogOutline({ outline, wordCount }: BlogOutlineProps) {
  if (!outline || outline.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-[#3b82f6]" />
            <h3 className="text-lg font-semibold text-gray-900">Blog Outline</h3>
          </div>
          {wordCount && (
            <Badge className="bg-blue-100 text-blue-700">
              ~{wordCount} words
            </Badge>
          )}
        </div>

        {/* Outline */}
        <div className="space-y-4">
          {outline.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f93a87] flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{section.heading}</h4>

                  {section.subheadings && section.subheadings.length > 0 && (
                    <ul className="mt-2 space-y-1.5 ml-4">
                      {section.subheadings.map((subheading, subIndex) => (
                        <li key={subIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                          <span>{subheading}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
