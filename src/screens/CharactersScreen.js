import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS, DEBOUNCE_MS } from '../config/constants';
import { getCharacters } from '../services/charactersService';
import CharacterCard from '../components/CharacterCard';
import StateMessage from '../components/StateMessage';

const ItemSeparator = () => <View style={styles.separator} />;

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');

  const requestId = useRef(0);

  // Debounce: solo copia el texto a `query` si el usuario deja de escribir.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchText.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Carga inicial: se repite si cambia la búsqueda o se presiona "Reintentar".
  useEffect(() => {
    let ignore = false;
    requestId.current += 1;
    loadingMoreRef.current = false;

    async function loadCharacters() {
      setLoading(true);
      setError(null);
      setLoadingMore(false);
      setRefreshing(false);
      try {
        const data = await getCharacters({ page: 1, name: query });
        if (ignore) return;
        setCharacters(data.results);
        setPage(1);
        setHasNextPage(data.hasNextPage);
      } catch (e) {
        if (ignore) return;
        setCharacters([]);
        setHasNextPage(false);
        setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadCharacters();

    return () => {
      ignore = true;
    };
  }, [query, reloadKey]);

  async function loadMore() {
    if (loadingMoreRef.current || loading || refreshing || error || !hasNextPage) return;

    const myId = requestId.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await getCharacters({ page: page + 1, name: query });
      if (myId !== requestId.current) return;
      setCharacters((prev) => [...prev, ...data.results]);
      setPage(page + 1);
      setHasNextPage(data.hasNextPage);
    } catch (e) {
      if (myId !== requestId.current) return;
      setError(e.message);
    } finally {
      if (myId === requestId.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }

  async function handleRefresh() {
    requestId.current += 1;
    const myId = requestId.current;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setRefreshing(true);
    setError(null);
    try {
      const data = await getCharacters({ page: 1, name: query });
      if (myId !== requestId.current) return;
      setCharacters(data.results);
      setPage(1);
      setHasNextPage(data.hasNextPage);
    } catch (e) {
      if (myId !== requestId.current) return;
      setError(e.message);
    } finally {
      if (myId === requestId.current) setRefreshing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor={COLORS.textMuted}
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
      ) : error && characters.length === 0 ? (
        <StateMessage
          message={error}
          actionLabel="Reintentar"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <FlatList
          data={characters}
          renderItem={({ item }) => <CharacterCard character={item} />}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={
            <StateMessage
              message={
                query
                  ? `No se encontraron personajes para "${query}".`
                  : 'No hay personajes que mostrar.'
              }
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} color={COLORS.primary} />
            ) : error ? (
              <Text style={styles.footerError}>{error}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  loader: { marginTop: 40 },
  separator: { height: 10 },
  listContent: { paddingBottom: 24 },
  footer: { marginVertical: 16 },
  footerError: { color: COLORS.danger, textAlign: 'center', marginVertical: 16 },
});