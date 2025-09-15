/**
 * @file libs/ui/products/src/lib/filter-sidebar/category-tree.service.ts
 * @Version 1.1.0 (Fixed Types & Module Resolution)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   Service for fetching and managing category tree data from the backend.
 *   FIXED: All TypeScript type issues and proper return types.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { FilterOption } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { BackendCategory, CategoryTreeNode } from '@royal-code/shared/domain';


@Injectable({ providedIn: 'root' })
export class CategoryTreeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly logger = inject(LoggerService);
  private readonly apiUrl = `${this.config.backendUrl}/Products`;

  /**
   * Haal de volledige category tree op van de backend
   */
  getCategoryTree(): Observable<BackendCategory[]> {
    this.logger.debug('[CategoryTreeService] Fetching category tree from backend');
    return this.http.get<BackendCategory[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Async versie voor gebruik in components
   */
  async getCategoryTreeAsync(): Promise<BackendCategory[]> {
    try {
      return await firstValueFrom(this.getCategoryTree());
    } catch (error) {
      this.logger.error('[CategoryTreeService] Failed to fetch category tree:', error);
      return [];
    }
  }

  /**
   * Transformeer backend categorieën naar frontend CategoryTreeNode format
   */
  transformToTreeNodes(backendCategories: BackendCategory[], level: number = 0): CategoryTreeNode[] {
    return backendCategories.map(cat => ({
      id: cat.id,
      key: cat.key,
      name: this.getDisplayNameFromKey(cat.key),
      slug: cat.key,
      parentId: cat.parentId,
      children: this.transformToTreeNodes(cat.children, level + 1),
      level,
      count: 0,
      isExpanded: level === 0, // Top level standaard uitgeklapt
      isSelected: false
    }));
  }

  /**
   * Combineer category tree met counts uit filter data
   */
  enrichTreeWithCounts(
    tree: CategoryTreeNode[], 
    filterOptions: FilterOption[], 
    selectedCategoryIds: readonly string[] = []
  ): CategoryTreeNode[] {
    // Maak een count map van de filter opties
    const countMap = new Map<string, number>();
    filterOptions.forEach(option => {
      countMap.set(option.value, option.count);
    });

    return this.enrichNodeWithCounts(tree, countMap, [...selectedCategoryIds]);
  }

  private enrichNodeWithCounts(
    nodes: CategoryTreeNode[], 
    countMap: Map<string, number>,
    selectedCategoryIds: string[]
  ): CategoryTreeNode[] {
    return nodes.map(node => {
      const enrichedChildren = this.enrichNodeWithCounts(node.children, countMap, selectedCategoryIds);
      
      // Directe count uit filter data
      const directCount = countMap.get(node.id) || 0;
      
      // Totaal count inclusief kinderen
      const childrenCount = enrichedChildren.reduce((sum, child) => sum + (child.count || 0), 0);
      const totalCount = directCount + childrenCount;

      return {
        ...node,
        children: enrichedChildren,
        count: totalCount,
        isSelected: selectedCategoryIds.includes(node.id),
        // Hou expanded state als er kinderen zijn met counts > 0
        isExpanded: node.isExpanded || enrichedChildren.some(child => (child.count || 0) > 0)
      };
    });
  }

  /**
   * Converteer category key naar display naam
   */
  private getDisplayNameFromKey(key: string): string {
    // Eenvoudige conversie - in production zou je een translation service gebruiken
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    
    // Converteer camelCase naar readable text
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  }

  /**
   * Vind een node in de tree op basis van ID
   */
  findNodeById(tree: CategoryTreeNode[], id: string): CategoryTreeNode | null {
    for (const node of tree) {
      if (node.id === id) {
        return node;
      }
      const found = this.findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Krijg alle parent IDs van een gegeven node
   */
  getParentPath(tree: CategoryTreeNode[], nodeId: string): string[] {
    const path: string[] = [];
    const node = this.findNodeById(tree, nodeId);
    
    if (!node) return path;
    
    let currentParentId = node.parentId;
    while (currentParentId) {
      const parentNode = this.findNodeById(tree, currentParentId);
      if (parentNode) {
        path.unshift(parentNode.id);
        currentParentId = parentNode.parentId;
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Toggle expanded state van een node
   */
  toggleNodeExpanded(tree: CategoryTreeNode[], nodeId: string): CategoryTreeNode[] {
    return this.updateNodeInTree(tree, nodeId, node => ({
      ...node,
      isExpanded: !node.isExpanded
    }));
  }

  /**
   * Update een specifieke node in de tree
   */
  private updateNodeInTree(
    tree: CategoryTreeNode[], 
    nodeId: string, 
    updater: (node: CategoryTreeNode) => CategoryTreeNode
  ): CategoryTreeNode[] {
    return tree.map(node => {
      if (node.id === nodeId) {
        return updater(node);
      }
      return {
        ...node,
        children: this.updateNodeInTree(node.children, nodeId, updater)
      };
    });
  }
}