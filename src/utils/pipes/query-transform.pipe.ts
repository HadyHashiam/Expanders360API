import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
    transform(value: any) {
        const transformed = { ...value };
        // Convert page and limit to numbers
        if (transformed.page) transformed.page = parseInt(transformed.page, 10);
        if (transformed.limit) transformed.limit = parseInt(transformed.limit, 10);
        // Convert sort to array (e.g., "title,-budget" -> ["title", "-budget"])
        if (transformed.sort) {
            transformed.sort = transformed.sort.split(',').map((s: string) => s.trim());
        }
        // Convert filter params (e.g., budget[gte]=10000 -> { budget: { gte: 10000 } })
        const filter: any = {};
        Object.keys(transformed).forEach(key => {
            if (key.includes('[')) {
                const [field, operator] = key.split(/\[|\]/).filter(Boolean);
                if (['gte', 'gt', 'lte', 'lt'].includes(operator)) {
                    filter[field] = { ...filter[field], [operator]: parseFloat(transformed[key]) };
                    delete transformed[key];
                }
            }
        });
        transformed.filter = filter;

        return transformed;
    }
}