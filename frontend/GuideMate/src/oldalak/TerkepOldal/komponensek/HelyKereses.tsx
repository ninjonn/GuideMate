import React from 'react';
import {
  Box,
  Button,
  Collapse,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import type { Place, SearchCategory } from '../../../lib/opentripmap';
import EredmenyekLista from './EredmenyekLista';

type HelyKeresesProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  isMobile: boolean;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenPanel: () => void;
  selectedCategory: string;
  categories: SearchCategory[];
  onFilter: (id: string) => void;
  places: Place[];
  loadingPlaces: boolean;
  hasMore: boolean;
  mode: 'area' | 'specific';
  loadingMore: boolean;
  onSelectPlace: (place: Place) => void;
  onLoadMore: () => void;
  panelStyle: Record<string, string | number>;
};

const HelyKereses: React.FC<HelyKeresesProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isMobile,
  isPanelOpen,
  onTogglePanel,
  onOpenPanel,
  selectedCategory,
  categories,
  onFilter,
  places,
  loadingPlaces,
  hasMore,
  mode,
  loadingMore,
  onSelectPlace,
  onLoadMore,
  panelStyle,
}) => {
  return (
    <Box
      w={{ base: '100%', lg: '360px' }}
      h={{
        base: isPanelOpen ? '45vh' : 'auto',
        md: isPanelOpen ? '55vh' : 'auto',
        lg: '65vh',
      }}
      maxH={{
        base: isPanelOpen ? '50vh' : 'none',
        lg: '65vh',
      }}
      {...panelStyle}
      pointerEvents="auto"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      mb={{ base: 4, lg: 0 }}
    >
      <Box p={4} borderBottom={isPanelOpen || !isMobile ? '1px solid rgba(0,0,0,0.1)' : 'none'}>
        <InputGroup size="md" mb={3}>
          <Input
            pr="4.5rem"
            placeholder="Ország, város"
            bg="white"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            onFocus={() => isMobile && onOpenPanel()}
            onClick={() => isMobile && onOpenPanel()}
            borderRadius="full"
          />
          <InputRightElement width="3rem">
            <IconButton
              h="1.75rem"
              size="sm"
              aria-label="Keresés"
              icon={<SearchIcon />}
              onClick={onSearch}
              variant="ghost"
            />
          </InputRightElement>
        </InputGroup>

        {isMobile && (
          <Button variant="ghost" size="xs" rightIcon={<ChevronDownIcon />} onClick={onTogglePanel}>
            {isPanelOpen ? 'Elrejtés' : 'Találatok'}
          </Button>
        )}
      </Box>

      <Collapse in={!isMobile || isPanelOpen} animateOpacity>
        <Box px={4} pb={2}>
          <HStack
            spacing={2}
            pb={2}
            flexWrap={{ base: 'wrap', md: 'nowrap' }}
            overflowX={{ base: 'hidden', md: 'auto' }}
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                flexShrink={0}
                onClick={() => onFilter(cat.id)}
                colorScheme={selectedCategory === cat.id ? 'blue' : 'gray'}
              >
                {cat.label}
              </Button>
            ))}
          </HStack>
        </Box>
        <VStack
          flex={1}
          overflowY="auto"
          spacing={0}
          align="stretch"
          p={2}
          maxH={{
            base: isPanelOpen ? '28vh' : '0',
            md: isPanelOpen ? '35vh' : '0',
            lg: 'calc(65vh - 130px)',
          }}
          sx={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
            },
          }}
        >
          <EredmenyekLista
            places={places}
            loading={loadingPlaces}
            mode={mode}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onSelectPlace={onSelectPlace}
            onLoadMore={onLoadMore}
          />
        </VStack>
      </Collapse>
    </Box>
  );
};

export default HelyKereses;
