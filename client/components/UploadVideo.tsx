import { Button, Group, Modal, Progress, Switch, Text, TextInput, Stack } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";
import { AxiosError, AxiosResponse } from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useMutation } from "react-query";
import { ArrowBigUpLine } from 'tabler-icons-react';
import { updateVideo, uploadVideo } from "../api";
import { useVideo } from "../context/Videos";
import { Video } from "../types";


function EditVideoForm({ videoId, setOpened }: {
    videoId: string,
    setOpened: Dispatch<SetStateAction<boolean>>;
}) {

    const { refetch } = useVideo()
    const form = useForm({
        initialValues: {
            title: "",
            description: "",
            published: true
        }
    });

    const mutation = useMutation<AxiosResponse<Video>, AxiosError, Parameters<typeof updateVideo>["0"]>(updateVideo, {
        onSuccess: () => {
            setOpened(false);
            refetch();
        }
    })

    return (
        <form onSubmit={form.onSubmit(values =>
            mutation.mutate({ videoId, ...values })
        )}
        >
            <Stack>
                <TextInput
                    label="Title"
                    required
                    placeholder="My awesome video"
                    {...form.getInputProps("title")}
                />
                <TextInput
                    label="Description"
                    required
                    {...form.getInputProps("description")}
                />

                <Switch label="published" {...form.getInputProps("published")} />

                <Button type="submit">Save</Button>
            </Stack>
        </form>
    );
}

function UploadVideo() {

    const [opened, setOpened] = useState(false);
    const [progress, setProgress] = useState(0);

    const mutation = useMutation(uploadVideo)

    const config = {
        onUploadProgress: (progressEvent: any) => {
            const percent = Math.round(
                (progressEvent.loaded * 100 / progressEvent.total)
            );

            setProgress(percent);
        }
    }

    function upload(files: File[]) {
        const formData = new FormData()

        formData.append('video', files[0])

        mutation.mutate({ formData, config });
    }

    return (
        <>
            <Modal
                closeOnClickOutside={false}
                onClose={() => setOpened(false)}
                opened={opened}
                title="Upload Video"
                size="xl"
            >
                {progress === 0 && (
                    <Dropzone
                        onDrop={files => {
                            upload(files);
                        }}
                        accept={[MIME_TYPES.mp4]}
                        multiple={false}
                    >
                        {(status) => {
                            return (
                                <Group
                                    position="center"
                                    spacing="xl"
                                    style={{
                                        minHeight: "50vh",
                                        justifyContent: "center"
                                    }}
                                    direction="column"
                                >
                                    <ArrowBigUpLine />
                                    <Text>Drag Video here or click to find</Text>
                                </Group>
                            );
                        }}
                    </Dropzone>
                )}
                {progress > 0 && (
                    <Progress
                        size="xl"
                        label={`${progress}%`}
                        value={progress}
                        mb="xl"
                    />
                )}

                {mutation.data && (
                    <EditVideoForm
                        setOpened={setOpened}
                        videoId={mutation.data.videoId}
                    />
                )}
            </Modal>

            <Button onClick={() => setOpened(true)}>Upload Video</Button>
        </>
    )
}

export default UploadVideo;