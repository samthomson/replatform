import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoginArea } from '@/components/auth/LoginArea';
import { Check, Loader2, Upload } from 'lucide-react';

const BLOSSOM_BASE = 'https://bs.samt.st';

// Video and thumbnail data from bs.samt.st blossom server
// Videos and thumbnails paired by upload order
const VIDEOS = [
  { video: '06a095f60795ac59acac80b3d89946d2b6733ee5503966969016e8fd1222316d', thumb: '0ca9e87ab9ac246a5794369a6297c53ee48a98edbf88a9523525125a02c3747f' },
  { video: '10b63f2e896bc5389c786a8c7586db3dea8c831744d07f05bd23f29b13742b03', thumb: '147af9e98649626cbe0adbd52acf1be4b2d1e7880567683d2f6aaef223b95f75' },
  { video: '1ca9999ece3acf2ac47858f28e42e254829e3eef5c61b29bd9ebffc7406b7d64', thumb: '15430c83a9948238cc4ff0ab2a8d4eadc83612f134338528d8e30c7deb5d88b9' },
  { video: '1f9a638093b69278a9205c6040d390d6ae71335197928dd76c3ce0fa18dd759b', thumb: '1af2a086fb47201c53593d448b12b8aa55024828ff094633849b6d4abae7d135' },
  { video: '2bcb138fbfcfedde3af2a75b8bb531026968ef5112c45d5c7027d38bd4c5604e', thumb: '1feca4abec04a0116544d97a872a009d2ba5fafa6bcc7681296579d024904583' },
  { video: '2e0ffcabfc6b8ff08329a33cad6b1012e069b3b9753ecd56999312f196227536', thumb: '295d5d6286f27c30b092f0efe9a62a2db62832ad7af98c2d9e5a913756e9c1b1' },
  { video: '304610835644c218e1f9a3a962929b7647648f0404f4a8104d3c229e21621ed1', thumb: '2983a9c37c8d03c19eae5e354f60b2a52733fe1bd655146b1d5db36abcf86451' },
  { video: '315d1d4868cffde3211d04db26eb91f792e135fd6ed77afffa22cea2f2b4c4e6', thumb: '2e6339ba6b669c5d34b02773425fe31a987e915bad2b475e50ce98cc701f807d' },
  { video: '3ce7e47d5eaf7bdd08e0fdf74c83f5fe9c63f144d00cc786b4514ecbb2c71f4f', thumb: '3793003ef6e7d0b6c2cfdb03c2c68155221233b4decd6395bd44949e9610db86' },
  { video: '3d341b72a06239513d351e60a233361a0f8ebcac7d3f03fcd757cb9b2da041af', thumb: '479bbc66908135698dca2b07ffdd087de41e682643823e2271b31043b67ad397' },
  { video: '3ec8bf009556c69ebc8658d33e609a2b33be200246162e82faf72ba6a356af57', thumb: '4b1b7b642d9f5a3d3653419fa356da4eeffdd4499f33d8665d9067f60c402057' },
  { video: '417ca6d0cce8817f1b08ef934a522b8ebefef057e1d39ecabb819c2faba501e0', thumb: '4e357e4ea7102f2be9cd0fafca00736ce005304d3bc7a7cb29ce6fc26379b975' },
  { video: '4a862acbee415abe109312db0b060eb6dc1a7152cf80a065c7ce49b471018251', thumb: '51b78d9c61b3139a273ec82da231bdab3d6a72daab7f53feb769a6a2b7a71bc5' },
  { video: '50021af3d4f22d044eb933f9dc5fb198588d65b59914c57c03a7276bc9653838', thumb: '54ff313f7d85ed50e24f603dbaf0972330d1a7821f7baeb3e0f69c7b2601ab18' },
  { video: '595a70a56216825ef885dca27ea030c143544b7b98b20eaad3b45136fc9443c7', thumb: '62b2e21cb1d4733b1dd72ed387ac2e0715acc6cabcf0bdc19fc42d76de8214e1' },
  { video: '59dd28f3f749de1da779584b21373bb77a4c204c85ea8ce99d355fc03f2f1f42', thumb: '6498d4b640517269af0729415893d776cb6f95e2d50f8d1103a49fe15adccc1b' },
  { video: '6bd47858f39e6f991e7fe61b061c70c581945cb583c326d52ef5f8f5e538e960', thumb: '6ba0cdf6c39ea90268c1c1621369a528a9e9d1b0adb24f3bb5d9bcd3c05e10ca' },
  { video: '6dc80c325c75c843692342dade5086ede5eb129093d15d54db0a0b312bc63144', thumb: '6f9469f45bbf30e89352abd7f23362ce4be88f4d0133ffd1953eabdbc09dfeda' },
  { video: '7b9d283ab61e6e62fcf3ab89f61e577417c6e54a75ed47c9ebacce68c2449277', thumb: '749f9e440bd9385f4d8dda2739603069941809c71fbafbfe1f87076339041616' },
  { video: '8b2ddce66f94f533608504a406106003377291b1e4ea573595bfd6f40f20082d', thumb: '75206a5d74cd348d8feb10530fb3e6a2742c64ffca4919fb8fe3a566ebd314b2' },
  { video: '8d3d80ac301e179eaf469455f5ba394fd446cf9ef884a7636a2f94d4333ae5fb', thumb: '77003de268e7f93c8baa2411527f6802140d2274375eb0b27ae38058c94b701d' },
  { video: '8f979094e7e1c607a11ccac2e1009d759382d515c681107a28e24b0b35412013', thumb: '781d4a5aecc02062c1e0253985950fa6e83be79544cc2aa61748e594affb3fac' },
  { video: '8fd3a036b15097737e05eedd8dd9a0310d7cd088d680e71bbc48af8a346f237a', thumb: '7c07fe2b3450fabe5158e4e320fd6a7b1b603016a9e53d6e0b6506091d9e3d23' },
  { video: '9427a605d43ebaf72b99080edf469738a2295e1bc910ca6b2cea2ab7af7a9c65', thumb: '7ee561d8435f7cd8df37dba7f5cfed6ac0ecd889201d4a493c74641bf402b81a' },
  { video: '9ece3e89195aeb10ce8df5ca67da77f6df95a96c7af1c69b68bd292d325ec16b', thumb: '940dbac1e7b20ce187fe789d74f26414b93c0b439d6ea3e67ae1906597cc08cf' },
  { video: 'a5c241890524c0614fdf28426cf2a60ed022ce925168b67466a686059df52458', thumb: '9bc5b55f7a6ad9202b90b7596e0c64573d6c282cbe12a311c92b67fe72bd1eb6' },
  { video: 'a9aebabc07a3102ee30e66f8f24362c765d5cfa01a77d8071ee6a62ca3f1ac32', thumb: 'a4e0e54b6610c3ad08ecf808b53d6b18c6c0f60645075be7a927b132a3ecb709' },
  { video: 'b519f91fb5379d1b3ef3ed4538a000e76dca355bb0f320d65189b7bcba1beacd', thumb: 'a51dfec49c43c5ccd23f51caa1d9ee8f0f1e08f33623e50f9b0c2baef573887d' },
  { video: 'c0df4f6df6f3e353cd118d1b11c2b8fd790d32959d414f4aec25e70f63be123c', thumb: 'a81a4c4d087a0720806b0d427cb286b06b291677f9847ed1daf52a9005ec3b19' },
  { video: 'c9fc5990c7c1c16e17b3354083c0272b3892c3432a238f366dd128805a056520', thumb: 'a96276295d808ab07e85425472e6ea51cce41759d23790e24002716d806d1252' },
  { video: 'ccb9b8213baaa7f83ffe21a5bd9918332177299b44264e05fb7d022af5f43612', thumb: 'ac8304a8eb7717d677904555e8a4e354ee454d4a3bc0e623de19a5b2c6f3cfc5' },
  { video: 'cf4dfc38e088c23f830dbb582fedca031c775038b8266a27e709ac3e9387170e', thumb: 'b534c6cf151fd93dbed98a49598406340abd7796f27451f7a05839891ccec4a1' },
  { video: 'df20667701bf760e38c0dd37b92b203ff83389edf18602d19b8404538334a74b', thumb: 'b9137056eb40baf7fc6050ad9b3a3a07900e595e2133ac8d4b570e56f8872997' },
  { video: 'fbe5eea9dbad83aec69440e416293a2ee05e755e4cfbfffa3ab2843f3cae509a', thumb: 'be307eb4b4041267d8c613248e01dd5488ae9227787c5d2da1ce0008fda870c6' },
  { video: 'fc5c6b3ebb0b5d0c0c23fbff344862801861d293d87da98a0dee51b4ca500b45', thumb: 'c7bcecaba2bd95581266f86f8db4df56707b9efbd0a534d185ec08674dfddd48' },
  { video: 'fd30a61813e6cfe2d7d13af63104abbcc851d50d07b3ad044b4068d68ca9a097', thumb: 'd676cf09966ce61bad06593015368523aac80d1182655f17435943d3cab46fe4' },
  { video: 'fd7cdf471c953eb974d56d279e6fd2fae31640769a585a5c48d2af053335a559', thumb: 'e0e27158bad044e3af4c723dab1581d3a25ea0ba3a5f2445f2e610f97fa78c31' },
  { video: 'cf5cb349dedbfff624f7e2e908ca09053130de423de0a19a6c16ec1e640897e7', thumb: 'e629ad73c50d35bc96f22e0302e56c9c4f491d087ae59dd9d7e5498c6a657689' },
  { video: 'cf5cb349dedbfff624f7e2e908ca09053130de423de0a19a6c16ec1e640897e7', thumb: 'ef333d2ef821894c3634ca12d2359c38fd77c90a7f8709f130d7e90d8ad3e2d3' },
];

type PublishStatus = 'pending' | 'publishing' | 'published' | 'error';

export default function AdminPublishVideos() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const [statuses, setStatuses] = useState<Record<number, PublishStatus>>({});
  const [isPublishingAll, setIsPublishingAll] = useState(false);

  const publishVideo = async (index: number) => {
    const video = VIDEOS[index];
    const videoUrl = `${BLOSSOM_BASE}/${video.video}.mp4`;
    const thumbUrl = `${BLOSSOM_BASE}/${video.thumb}.jpeg`;

    setStatuses(prev => ({ ...prev, [index]: 'publishing' }));

    try {
      await publishEvent({
        kind: 34236,
        content: '',
        tags: [
          ['d', video.video],
          ['imeta',
            `url ${videoUrl}`,
            'm video/mp4',
            `image ${thumbUrl}`,
            `x ${video.video}`,
          ],
          ['alt', `Video ${index + 1}`],
        ],
      });
      setStatuses(prev => ({ ...prev, [index]: 'published' }));
    } catch (error) {
      console.error('Failed to publish video:', error);
      setStatuses(prev => ({ ...prev, [index]: 'error' }));
    }
  };

  const publishAll = async () => {
    setIsPublishingAll(true);
    for (let i = 0; i < VIDEOS.length; i++) {
      if (statuses[i] !== 'published') {
        await publishVideo(i);
        // Small delay between publishes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setIsPublishingAll(false);
  };

  const publishedCount = Object.values(statuses).filter(s => s === 'published').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-xl font-bold">Admin: Publish Videos</h1>
            <p className="text-muted-foreground">You must be logged in to publish videos.</p>
            <LoginArea className="justify-center" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Publish Video Events</h1>
            <p className="text-muted-foreground">
              Publish kind 34236 events for {VIDEOS.length} videos ({publishedCount} published)
            </p>
          </div>
          <Button
            onClick={publishAll}
            disabled={isPublishingAll || publishedCount === VIDEOS.length}
            size="lg"
          >
            {isPublishingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publish All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {VIDEOS.map((video, index) => {
            const status = statuses[index] || 'pending';
            const thumbUrl = `${BLOSSOM_BASE}/${video.thumb}.jpeg`;

            return (
              <Card key={video.video} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={thumbUrl}
                    alt={`Video ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {status === 'published' && (
                    <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {status === 'publishing' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                      <span className="text-white font-bold">Error</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <Button
                      size="sm"
                      variant={status === 'published' ? 'outline' : 'default'}
                      onClick={() => publishVideo(index)}
                      disabled={status === 'publishing' || isPublishingAll}
                    >
                      {status === 'published' ? 'Done' : 'Publish'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
