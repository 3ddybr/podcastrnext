import { GetStaticPaths, GetStaticProps } from 'next';
import {useRouter} from 'next/router';
import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image';
import Link from 'next/link'
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';

import {usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';

type Episode={
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    members:string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;
};

type EpisodeProps = {
    episode: Episode;
}
export default function Episode ({episode}:EpisodeProps) {
    const {play} = usePlayer();
    // const router = useRouter();  //por nao estar usando o fallback = true  nao e necessário fazer essa verificação 

    // if (router.isFallback){
    //     return <p>Carregando...</p>
    // }
    return(
        <div className={styles.episode}>

        <Head>
            <title>{episode.title} | Podcastr </title>
        </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                <button>
                    <img src="/arrow-left.svg" alt="Voltar"/>
                </button>
                </Link>
                <Image
                width={700}
                height={160}
                src={episode.thumbnail}
                objectFit="cover"
                />
                <button type="button" onClick={()=> play(episode)}>
                    <img src="/play.svg" alt="Tocar episodio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div 
            className={styles.description} 
            dangerouslySetInnerHTML={{__html: episode.description}}
            />
                
            

        </div>

    )
}

export const getStaticPaths: GetStaticPaths = async () => { //toda rota que tem o [] precisa-se informar esse método getStaticProps
    const {data} = await api.get('episodes', {  //gerar essa config para poder carregar em cache __limite e episode 
        params: {
            _limit: 2,
            _sort:'published_at',
            _order: 'desc'
        }
    })

    const paths =data.map(episode=>{
        return {
            params: {
                slug:episode.id
            }
        }           
    })

    return {
        paths, 
        fallback:'blocking'
    }
}  //ate aqui .

    

export const getStaticProps: GetStaticProps = async(ctx) => {
    const {slug} = ctx.params; //slug 'e exatamente o nome do arquivo dentro da pasta episodes

    const {data} = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt:format(parseISO(data.published_at), 'd MMM yy', {locale:ptBR}),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
      };

    return {
        props:{
            episode,
        },
        revalidate: 60*60*24, //24 hours
    }
}